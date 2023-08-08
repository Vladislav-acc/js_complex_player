from flask import Flask, render_template, Response
from flask_cors import CORS, cross_origin


app = Flask(__name__)
app.config['SECRET_KEY'] = 'SECRET KEY'
app.config['CORS_HEADERS'] = 'Content-Type'
app.debug = True

cors = CORS(app, supports_credentials=True, origins=['http://127.0.0.1:5000'])

# @app.after_request
# def after_request(response: Response) -> Response:
#     response.access_control_allow_origin = 'http://127.0.0.1:5000'
#     return response

@app.route('/')
# @cross_origin(supports_credentials=False, origin='http://127.0.0.1:5000', headers=['Content-Type', 'Authorization'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()