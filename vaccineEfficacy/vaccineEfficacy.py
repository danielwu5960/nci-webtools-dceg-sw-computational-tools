from flask import Flask, render_template, request, jsonify
import rpy2.robjects as robjects
from rpy2.robjects.packages import SignatureTranslatedAnonymousPackage
from rpy2.robjects.vectors import IntVector, FloatVector
from socket import gethostname
from flask.ext.cors import CORS
import os
import re
import time
import json
import logging


# Initialize the Flask application
app = Flask(__name__, template_folder='', static_folder='', static_url_path='')  
#cors = CORS(app, resources={r"/vaccineEfficacyRest/*": {"origins": "*"}}) 

# The following is a test data
R0 = "0.70, 0.70,0.70,0.70,0.70,0.70,0.70,0.70,0.70"
alpha = "0.025,0.025,0.025,0.025,0.025,0.025,0.025,0.025,0.025"
k = "0.474,0.474,0.474,0.474,0.474,0.474,0.474,0.474,0.474"
p1 = "0.009, 0.009, 0.010, 0.011, 0.011, 0.012, 0.013, 0.014, 0.014" 
p2 = "0.012, 0.013, 0.014, 0.015, 0.016, 0.017, 0.018, 0.019, 0.020"
N = "4437, 4437, 4437, 4437, 4437, 4437, 4437, 4437, 4437"
v_R0 = FloatVector(R0.split(','))
v_alpha = FloatVector(alpha.split(','))
v_k = FloatVector(k.split(','))
v_p1 = FloatVector(p1.split(','))
v_p2 = FloatVector(p2.split(','))
v_N = FloatVector(N.split(','))
print v_R0
print v_alpha
print v_k
print v_p1
print v_p2
print v_N 
# end of test data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/vaccineEfficacyRest/calc', methods = ['POST'])
def callRFunction():
    # Get the parsed contents of the form data
    requestData = request.get_json()
    print time.strftime('%X %x %Z')
    print '[Request]' + json.dumps(requestData)
    print 'independent: ' + requestData['independent_variable'] + ' = ' + requestData['independent_value']
    print 'contour: ' + requestData['contour_variable'] + ' = ' + requestData['contour_value']
    print 'fixed: ' + requestData['fixed_variable'] + ' = ' + requestData['fixed_value']
    print 'R0: ' + requestData['r0_variable'] + ' = ' + requestData['r0_value']
    print 'alpha: ' + requestData['alpha_variable'] + ' = ' + requestData['alpha_value']
    print 'k: ' + requestData['k_variable'] + ' = ' + requestData['k_value']
    # Processing data.
    rSource = robjects.r('source')
    rSource('./ScoreMethod.R')
    rFindPower_scorep1p2 = robjects.globalenv['findPower_scorep1p2']
    jsonrtn = rFindPower_scorep1p2(v_R0,v_p1,v_p2,v_alpha,v_N, v_k)
    print '***'
    print jsonrtn 
    print '***'
    jsonlist=list(jsonrtn)
    jsonstring=''.join(str(jsonlist))
    print '[Return]' + jsonstring
    # Adjust the values tempararily.
    _v_R0=0.70
    _v_alpha = 0.025
    _v_k = 0.474
    _v_N = 4437
    img_path='./tmp/plot1.png'
    rSource('./ScoreMethodWrapper.R')
    wrapperDrawPowerp1p2 = robjects.globalenv['wrapperDrawPowerp1p2']
    wrapperDrawPowerp1p2(img_path, v_p1, v_p2, _v_R0, _v_alpha, _v_N, _v_k)
    print '[Plot]' + img_path
    retstring = json.dumps('{"pdata":' + jsonstring + ',"plot":"'+img_path+'"}')
    print retstring
    return retstring 


import argparse
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("-p", dest="port_number", default="9982", help="Sets the Port") 
    # Default port is production value; prod,stage,dev = 9982, sandbox=9983
    args = parser.parse_args()
    port_num = int(args.port_number);    
    hostname = gethostname()
    app.run(host='0.0.0.0', port=port_num, debug = True)
