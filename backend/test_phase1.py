import sys
import os
sys.path.insert(0, os.path.abspath('backend'))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

res_health = client.get('/api/health')
print('Health check status:', res_health.status_code, res_health.json())
assert res_health.status_code == 200

res_login = client.post('/api/auth/login', json={'username': 'admin', 'password': 'Password123!'})
print('Admin login status:', res_login.status_code)
assert res_login.status_code == 200
token_data = res_login.json()
print('Token Role:', token_data['role'], 'Token prefix:', token_data['access_token'][:20])
assert token_data['role'] == 'ADMIN'

token = token_data['access_token']
headers = {'Authorization': 'Bearer ' + token}
res_me = client.get('/api/auth/me', headers=headers)
print('Auth me status:', res_me.status_code, res_me.json()['full_name'])
assert res_me.status_code == 200

res_drv = client.post('/api/auth/login', json={'username': 'driver', 'password': 'Password123!'})
assert res_drv.status_code == 200
assert res_drv.json()['role'] == 'DRIVER'
print('Driver login verified successfully!')

print('>>> ALL PHASE 1 BACKEND AUTH & DB TESTS PASSED! <<<')
