// API配置
const API_BASE_URL = 'http://neuronx.top:8000'; // 请替换为实际的API域名

// 全局变量
let currentUser = null;
let accessToken = null;
let selectedVerification = null;
let countdownTimer = null;
let currentLoginMethod = 'password';
let emailLoginTimer = null;
let smsLoginTimer = null;

// 工具函数
function showAlert(message, type = 'error') {
    // 移除现有的alert
    const existingAlert = document.querySelector('.alert');
    if (existingAlert && existingAlert.parentNode) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = message;
    
    const currentStep = document.querySelector('.step.active');
    currentStep.insertBefore(alert, currentStep.firstChild);
    
    // 3秒后自动移除错误提示
    if (type === 'error') {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    }
}

function showStep(stepNumber) {
    // 隐藏所有步骤
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    
    // 显示指定步骤
    document.getElementById(`step${stepNumber}`).classList.add('active');
    
    // 更新步骤指示器
    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        if (index < stepNumber) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function setLoading(buttonId, loading = true) {
    const button = document.getElementById(buttonId);
    if (loading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span>处理中...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || '确定';
    }
}

// API调用函数
async function apiCall(endpoint, method = 'GET', data = null, useAuth = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (useAuth && accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const config = {
        method,
        headers,
    };
    
    if (data) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.detail || `HTTP error! status: ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API调用失败:', error);
        throw error;
    }
}

// 登录方式选择
function selectLoginMethod(method) {
    currentLoginMethod = method;
    
    // 重置所有登录方式的选中状态
    document.querySelectorAll('.login-method').forEach(m => {
        m.classList.remove('active');
    });
    
    // 设置当前选中的登录方式
    document.getElementById(`${method}Method`).classList.add('active');
    
    // 隐藏所有登录表单
    document.querySelectorAll('.login-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // 显示对应的登录表单
    document.getElementById(`${method}Form`).style.display = 'block';
    
    // 清除之前的错误提示
    const existingAlert = document.querySelector('.alert');
    if (existingAlert && existingAlert.parentNode) {
        existingAlert.remove();
    }
}

// 密码登录
async function loginWithPassword() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('请输入用户名和密码');
        return;
    }
    
    const loginBtn = document.querySelector('#passwordForm .btn');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading"></span>登录中...';
    
    try {
        // 调用登录API
        const tokenData = await apiCall('/api/v1/users/login', 'POST', {
            username,
            password
        });
        
        accessToken = tokenData.access_token;
        
        // 获取用户信息
        const userData = await apiCall('/api/v1/users/me', 'GET', null, true);
        currentUser = userData;
        
        // 显示用户信息
        displayUserInfo();
        
        // 跳转到确认删除步骤
        showStep(2);
        
    } catch (error) {
        showAlert(`登录失败: ${error.message}`);
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '登录';
    }
}

// 邮箱验证登录处理
async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const code = document.getElementById('loginEmailCode').value.trim();
    const btn = document.getElementById('emailLoginBtn');
    
    if (!email) {
        showAlert('请输入邮箱地址');
        return;
    }
    
    // 如果还没有发送验证码，先发送验证码
    if (btn.textContent === '发送验证码') {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>发送中...';
        
        try {
            await apiCall('/api/v1/users/send-verification-code', 'POST', {
                email: email,
                action: 'login'
            });
            
            // 显示验证码输入框
            document.getElementById('emailCodeGroup').style.display = 'block';
            document.getElementById('emailResendSection').style.display = 'block';
            
            // 更改按钮文本
            btn.innerHTML = '验证登录';
            
            // 开始倒计时
            startLoginCountdown('email');
            
            showAlert('验证码已发送到您的邮箱', 'success');
            
        } catch (error) {
            showAlert(`发送验证码失败: ${error.message}`);
        } finally {
            btn.disabled = false;
        }
    } else {
        // 验证验证码并登录
        if (!code) {
            showAlert('请输入验证码');
            return;
        }
        
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>登录中...';
        
        try {
            // 使用邮箱验证码登录
            const tokenData = await apiCall('/api/v1/users/login-with-email-verification', 'POST', {
                email: email,
                code: code
            });
            
            accessToken = tokenData.access_token;
            
            // 获取用户信息
            const userData = await apiCall('/api/v1/users/me', 'GET', null, true);
            currentUser = userData;
            
            // 显示用户信息
            displayUserInfo();
            
            // 跳转到确认删除步骤
            showStep(2);
            
        } catch (error) {
            showAlert(`登录失败: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '验证登录';
        }
    }
}

// 短信验证登录处理
async function handleSmsLogin() {
    const phone = document.getElementById('loginPhone').value.trim();
    const code = document.getElementById('loginSmsCode').value.trim();
    const btn = document.getElementById('smsLoginBtn');
    
    if (!phone) {
        showAlert('请输入手机号码');
        return;
    }
    
    // 如果还没有发送验证码，先发送验证码
    if (btn.textContent === '发送验证码') {
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>发送中...';
        
        try {
            await apiCall('/api/v1/users/send-sms-verification-code', 'POST', {
                phone: phone,
                action: 'login'
            });
            
            // 显示验证码输入框
            document.getElementById('smsCodeGroup').style.display = 'block';
            document.getElementById('smsResendSection').style.display = 'block';
            
            // 更改按钮文本
            btn.innerHTML = '验证登录';
            
            // 开始倒计时
            startLoginCountdown('sms');
            
            showAlert('验证码已发送到您的手机', 'success');
            
        } catch (error) {
            showAlert(`发送验证码失败: ${error.message}`);
        } finally {
            btn.disabled = false;
        }
    } else {
        // 验证验证码并登录
        if (!code) {
            showAlert('请输入验证码');
            return;
        }
        
        btn.disabled = true;
        btn.innerHTML = '<span class="loading"></span>登录中...';
        
        try {
            // 使用短信验证码登录
            const tokenData = await apiCall('/api/v1/users/login-with-sms-verification', 'POST', {
                phone: phone,
                code: code
            });
            
            accessToken = tokenData.access_token;
            
            // 获取用户信息
            const userData = await apiCall('/api/v1/users/me', 'GET', null, true);
            currentUser = userData;
            
            // 显示用户信息
            displayUserInfo();
            
            // 跳转到确认删除步骤
            showStep(2);
            
        } catch (error) {
            showAlert(`登录失败: ${error.message}`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '验证登录';
        }
    }
}

// 显示用户信息
function displayUserInfo() {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <h4 style="margin-bottom: 15px; color: #333;">账号信息</h4>
        <div style="margin-bottom: 10px;"><strong>用户名:</strong> ${currentUser.username}</div>
        <div style="margin-bottom: 10px;"><strong>邮箱:</strong> ${currentUser.email || '未设置'}</div>
        <div style="margin-bottom: 10px;"><strong>手机号:</strong> ${currentUser.phone || '未设置'}</div>
        <div style="margin-bottom: 10px;"><strong>积分余额:</strong> ${currentUser.points_balance}</div>
        <div><strong>注册时间:</strong> ${new Date(currentUser.created_at).toLocaleDateString()}</div>
    `;
}

// 显示验证步骤
function showVerificationStep() {
    showStep(3);
    
    // 检查可用的验证方式
    const emailOption = document.querySelector('.verification-option[data-method="email"]');
    const smsOption = document.querySelector('.verification-option[data-method="sms"]');
    
    // 如果邮箱为空，隐藏邮箱验证选项
    if (!currentUser.email || currentUser.email.trim() === '') {
        if (emailOption) emailOption.style.display = 'none';
    } else {
        if (emailOption) emailOption.style.display = 'block';
    }
    
    // 如果没有手机号，隐藏短信验证选项
    if (!currentUser.phone || currentUser.phone.trim() === '') {
        if (smsOption) smsOption.style.display = 'none';
    } else {
        if (smsOption) smsOption.style.display = 'block';
    }
    
    // 检查是否还有可用的验证方式
     let availableCount = 0;
     let lastAvailableMethod = null;
     
     if (emailOption && emailOption.style.display !== 'none') {
         availableCount++;
         lastAvailableMethod = 'email';
     }
     
     if (smsOption && smsOption.style.display !== 'none') {
         availableCount++;
         lastAvailableMethod = 'sms';
     }
     
     if (availableCount === 0) {
         showMessage('您的账号没有可用的验证方式，无法删除账号。请先绑定邮箱或手机号。', 'error');
         return;
     }
     
     // 如果只有一个验证方式，自动选择
     if (availableCount === 1 && lastAvailableMethod) {
         selectVerificationMethod(lastAvailableMethod);
     }
}

// 选择验证方式
function selectVerification(type) {
    selectedVerification = type;
    
    // 重置选择状态
    document.querySelectorAll('.verification-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 设置选中状态
    document.getElementById(`${type}Option`).classList.add('selected');
    
    // 启用发送验证码按钮
    document.getElementById('sendCodeBtn').disabled = false;
}

// 发送验证码
async function sendVerificationCode() {
    if (!selectedVerification) {
        showAlert('请选择验证方式');
        return;
    }
    
    const sendBtn = document.getElementById('sendCodeBtn');
    sendBtn.setAttribute('data-original-text', '发送验证码');
    setLoading('sendCodeBtn');
    
    try {
        let endpoint, data;
        
        if (selectedVerification === 'email') {
            if (!currentUser.email) {
                throw new Error('您的账号未绑定邮箱，无法使用邮箱验证');
            }
            endpoint = '/api/v1/users/send-verification-code';
            data = {
                email: currentUser.email,
                action: 'delete_account'
            };
        } else {
            if (!currentUser.phone) {
                throw new Error('您的账号未绑定手机号，无法使用短信验证');
            }
            endpoint = '/api/v1/users/send-sms-verification-code';
            data = {
                phone: currentUser.phone,
                action: 'delete_account'
            };
        }
        
        await apiCall(endpoint, 'POST', data);
        
        // 更新提示信息
        const hint = document.getElementById('verificationHint');
        const target = selectedVerification === 'email' ? currentUser.email : currentUser.phone;
        hint.textContent = `验证码已发送到您的${selectedVerification === 'email' ? '邮箱' : '手机'}: ${target}`;
        
        // 跳转到验证码输入步骤
        showStep(4);
        
        // 开始倒计时
        startCountdown();
        
    } catch (error) {
        showAlert(`发送验证码失败: ${error.message}`);
    } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '发送验证码';
    }
}

// 登录验证码倒计时功能
function startLoginCountdown(type) {
    let seconds = 60;
    const countdownSpan = document.getElementById(`${type}Countdown`);
    const resendBtn = document.getElementById(`${type}ResendBtn`);
    
    resendBtn.disabled = true;
    
    const timer = setInterval(() => {
        countdownSpan.textContent = `(${seconds}s)`;
        seconds--;
        
        if (seconds < 0) {
            clearInterval(timer);
            countdownSpan.textContent = '';
            resendBtn.disabled = false;
        }
    }, 1000);
    
    // 保存定时器引用
    if (type === 'email') {
        emailLoginTimer = timer;
    } else {
        smsLoginTimer = timer;
    }
}

// 账号删除验证码倒计时功能
function startCountdown() {
    let seconds = 60;
    const countdownSpan = document.getElementById('countdown');
    const resendBtn = document.getElementById('resendBtn');
    
    resendBtn.disabled = true;
    
    countdownTimer = setInterval(() => {
        countdownSpan.textContent = `(${seconds}s)`;
        seconds--;
        
        if (seconds < 0) {
            clearInterval(countdownTimer);
            countdownSpan.textContent = '';
            resendBtn.disabled = false;
        }
    }, 1000);
}

// 发送邮箱登录验证码
async function sendEmailLoginCode(email) {
    try {
        setLoading(true);
        const response = await apiCall('/api/v1/users/send-verification-code', {
            method: 'POST',
            body: JSON.stringify({
                email: email,
                action: 'login'
            })
        });
        
        if (response.ok) {
            showMessage('验证码已发送到您的邮箱', 'success');
            startLoginCountdown('email');
        } else {
            const error = await response.json();
            showMessage(error.detail || '发送验证码失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    } finally {
        setLoading(false);
    }
}

// 发送短信登录验证码
async function sendSmsLoginCode(phone) {
    try {
        setLoading(true);
        const response = await apiCall('/api/v1/users/send-sms-verification-code', {
            method: 'POST',
            body: JSON.stringify({
                phone: phone,
                action: 'login'
            })
        });
        
        if (response.ok) {
            showMessage('验证码已发送到您的手机', 'success');
            startLoginCountdown('sms');
        } else {
            const error = await response.json();
            showMessage(error.detail || '发送验证码失败', 'error');
        }
    } catch (error) {
        showMessage('网络错误，请重试', 'error');
    } finally {
        setLoading(false);
    }
}

// 重新发送登录验证码
function resendLoginCode(type) {
    if (type === 'email') {
        const email = document.getElementById('loginEmail').value;
        if (email) {
            sendEmailLoginCode(email);
        }
    } else {
        const phone = document.getElementById('loginPhone').value;
        if (phone) {
            sendSmsLoginCode(phone);
        }
    }
}

// 重新发送账号删除验证码
function resendCode() {
    sendVerificationCode();
}

// 删除账号
async function deleteAccount() {
    const code = document.getElementById('verificationCode').value.trim();
    
    if (!code) {
        showAlert('请输入验证码');
        return;
    }
    
    if (code.length !== 6) {
        showAlert('验证码应为6位数字');
        return;
    }
    
    const deleteBtn = document.querySelector('#step4 .btn-danger');
    deleteBtn.setAttribute('data-original-text', '确认删除账号');
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="loading"></span>删除中...';
    
    try {
        // 调用用户自删除接口
        const deleteData = {
            verification_type: selectedVerification, // "email" 或 "sms"
            verification_code: code
        };
        
        // 直接调用删除当前用户接口
        await apiCall('/api/v1/users/me', 'DELETE', deleteData, true);
        
        // 清除本地数据
        accessToken = null;
        currentUser = null;
        
        // 显示成功页面
        document.getElementById('stepSuccess').classList.add('active');
        document.getElementById('step4').classList.remove('active');
        
        // 更新步骤指示器为全部完成
        document.querySelectorAll('.step-dot').forEach(dot => {
            dot.classList.add('active');
        });
        
    } catch (error) {
        showAlert(`删除账号失败: ${error.message}`);
    } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = '确认删除账号';
    }
}

// 退出登录
function logout() {
    accessToken = null;
    currentUser = null;
    selectedVerification = null;
    
    // 清空表单
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('verificationCode').value = '';
    
    // 重置验证选择
    document.querySelectorAll('.verification-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // 清除倒计时
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    
    // 返回登录步骤
    showStep(1);
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定密码登录回车键
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginWithPassword();
        }
    });
    
    // 绑定邮箱登录回车键
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleEmailLogin();
            }
        });
    }
    
    // 绑定邮箱验证码输入回车键
    const loginEmailCode = document.getElementById('loginEmailCode');
    if (loginEmailCode) {
        loginEmailCode.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleEmailLogin();
            }
        });
        
        // 邮箱验证码只允许数字
        loginEmailCode.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length > 6) {
                e.target.value = e.target.value.slice(0, 6);
            }
        });
    }
    
    // 绑定手机号登录回车键
    const loginPhone = document.getElementById('loginPhone');
    if (loginPhone) {
        loginPhone.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSmsLogin();
            }
        });
    }
    
    // 绑定短信验证码输入回车键
    const loginSmsCode = document.getElementById('loginSmsCode');
    if (loginSmsCode) {
        loginSmsCode.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSmsLogin();
            }
        });
        
        // 短信验证码只允许数字
        loginSmsCode.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value.length > 6) {
                e.target.value = e.target.value.slice(0, 6);
            }
        });
    }
    
    // 绑定验证码输入回车键
    document.getElementById('verificationCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            deleteAccount();
        }
    });
    
    // 验证码输入框只允许数字
    document.getElementById('verificationCode').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});

// 页面卸载时清除定时器
window.addEventListener('beforeunload', function() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
    }
});