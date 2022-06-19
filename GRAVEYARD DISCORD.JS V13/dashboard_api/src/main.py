from ariadne import (gql, graphql_sync, make_executable_schema,
                    QueryType, ObjectType)
from ariadne.constants import PLAYGROUND_HTML
from dotenv import load_dotenv
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from http.cookies import SimpleCookie # to parse cookies
import os
import requests
import time

from sessions import Sessions


load_dotenv() # load environment variables from .env

# these are all different domains for localhost (for testing cross-site stuff)
#WEBSITE_URL = 'http://localhost:3000'
#WEBSITE_URL = 'http://lvh.me:3000'
WEBSITE_URL = 'http://127.0.0.1:3000'


sessions_manager = Sessions('../data/sessions.json')


# -- GraphQL API under here --

type_defs = gql('''
    type Query {
        hello: String!
    }
''')

query = QueryType()


@query.field('hello')
def resolve_hello(_, info):
    user_agent = info.context['request'].headers.get('user-agent', 'guest')

    return f'Hello, {user_agent}!'


schema = make_executable_schema(type_defs, query)

app = Flask(__name__)

# TODO: make this CORS more specific (only for graphQL and oauth, not all paths)
#       (increase security)
# TODO: use cross_origin decorators instead of this CORS function
# this is to stop CORS block on graphQL requests
CORS(
    app,
    resources={
        '/api/graphql': {
            'origins': WEBSITE_URL,
            'supports_credentials': True # required to receive cookies
        },
        '/api/auth/discord/getsessionid': {
            'origins': WEBSITE_URL,
            'supports_credentials': True # required to set cookies
        }
    }
)

@app.route('/api/graphql', methods=['GET'])
def graphql_playground():
    # This will allow clients to explore your API using desktop GraphQL
    # Playground app. Disable if you dont wan't this.
    return PLAYGROUND_HTML, 200


@app.route('/api/graphql', methods=['POST'])
def graphql_server():
    # TODO: Make sure they are authenticated first
    # Authentication
    if 'session-id' not in request.cookies:
        # TODO: do something when no session is given (error)
        pass
    
    session_id = request.cookies.get('session-id')

    session = sessions_manager.get_session(session_id)

    # GraphQL queries are sent as POST
    data = request.get_json()

    success, result = graphql_sync(schema, data,
                                   context_value={'request': request,
                                                  'session': session},
                                   debug=app.debug)

    status_code = 200 if success else 400
    return jsonify(result), status_code


# -- Discord OAuth2 API under here --


@app.route('/api/auth/discord/redirect', methods=['GET'])
def discord_oauth_redirect():
    if 'code' in request.args:
        code = request.args['code']

        data = {
            'client_id': os.environ['DISCORD_OAUTH_CLIENT_ID'],
            'client_secret': os.environ['DISCORD_OAUTH_CLIENT_SECRET'],
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': request.base_url,
        }

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        r = requests.post('https://discord.com/api/v10/oauth2/token',
                          data=data, headers=headers)

        # TODO: handle for this error (should return an error) if the code
        #       given is invalid
        r.raise_for_status() # throws error if status is 4XX

        session_access_token = sessions_manager.create_session({
            **r.json(), # access_token, etc.
            'ip': request.remote_addr,
        })
        
        # TODO: remove the '*' and replace with the actual URI (reduce security
        #       risk) of the target window
        # the string below needs double curly braces for single curly braces
        # due to .format
        response = make_response('''
            <script defer>
                if (window.opener) {{
                    window.opener.postMessage(
                        {{type: 'discordOAuthLoggedIn', sessionAccessToken: '{0}'}},
                        '{1}'
                    );
                    window.close();
                }} else {{
                    window.location.replace('{1}?sat={0}');
                }}
            </script>
        '''.format(session_access_token, WEBSITE_URL))

        return response, 200

    # TODO: create a better error system (with more information)
    return 'Error, no code provided', 400


@app.route('/api/auth/discord/getsessionid', methods=['GET'])
def discord_get_session_id():
    # get the session id with the session access token on the website
    if 'sat' in request.args:
        session_access_token = request.args['sat']

        session_id = sessions_manager.get_session_id_by_session_access_token(session_access_token)

        if session_id is None:
            return 'Error, session does not exist or session has already been claimed', 400

        response = make_response()
        # same site is none so that it can be sent to the different domain website
        response.set_cookie('session-id', value=session_id, httponly=True,
                            secure=True, samesite='none')

        return response, 200

    return 'Error, no session access token provided', 400


if __name__ == '__main__':
    app.run(debug=True)