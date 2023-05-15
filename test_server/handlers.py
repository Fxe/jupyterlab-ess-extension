import json
import os

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

def get_ess_secret_folder():
    _path = os.path.abspath(os.path.expanduser('~/.ess'))
    if not os.path.exists(_path):
        os.mkdir(_path)
    return os.path.abspath(os.path.expanduser('~/.ess'))

class RouteHandler(APIHandler):

    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({"data": "This is /test-server/get_example endpoint!"}))

class route_ess_data_save_file(APIHandler):

    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        mode = 'w'
        t = body['kind']
        if t == 'hex_str':
            data = bytes.fromhex(body['data'])
            mode = 'wb'
        elif t == 'str':
            data = body['data']
        elif t == 'json':
            data = json.dumps(body['data'])
        else:
            self.finish({"error": f"unknown kind {t}"})
        filename = body['filename'].strip()
        print(body)
        print(mode)
        print(type(data))
        try:
            abspath = os.path.expanduser('~/') + filename
            if os.path.exists(abspath):
                self.finish({"error": "file exists: " + abspath})
            else:
                with open(abspath, mode) as fh:
                    fh.write(data)
                self.finish({"status": "success", "file": abspath})
        except Exception as e:
            self.finish({"error": str(e)})
        
class route_token_arm(APIHandler):

    @tornado.web.authenticated
    def get(self):
        try:
            p = get_ess_secret_folder()
            with open(p + '/arm', 'r') as fh:
                user, token = fh.read().split()
                self.finish({"token": token.strip(), "user": user.strip()})
        except Exception as e:
            self.finish(json.dumps({"error": str(e)}))

    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        user = body['user'].strip()
        token = body['token'].strip()
        try:
            p = get_ess_secret_folder()
            with open(p + '/arm', 'w') as fh:
                fh.write(f'{user}\n{token}\n')
            self.finish({"status": "success"})
        except Exception as e:
            self.finish({"error": str(e)})
        
class route_token_kbase(APIHandler):
    
    @tornado.web.authenticated
    def get(self):
        try:
            p = get_ess_secret_folder()
            with open(p + '/kbase', 'r') as fh:
                token = fh.read()
                self.finish({"token": token.strip()})
        except Exception as e:
            self.finish(json.dumps({"error": str(e)}))

    @tornado.web.authenticated
    def post(self):
        body = self.get_json_body()
        token = body['token'].strip()
        try:
            p = get_ess_secret_folder()
            with open(p + '/kbase', 'w') as fh:
                fh.write(f'{token}\n')
            self.finish({"status": "success"})
        except Exception as e:
            self.finish({"error": str(e)})

def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "test-server", "get_example")
    handlers = [
        (route_pattern, RouteHandler), 
        (url_path_join(base_url, "test-server", "token_arm"), route_token_arm),
        (url_path_join(base_url, "test-server", "token_kbase"), route_token_kbase),
        (url_path_join(base_url, "test-server", "save_file"), route_ess_data_save_file),
    ]
    web_app.add_handlers(host_pattern, handlers)
