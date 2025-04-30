$(document).ready(function() {
    $('#loginForm').submit(function(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        const roleId = $('#role').val();
  
        console.log('Sending login data:', { username, password, roleId });
  
        // $.ajax({
        //     url: '/api/user/index',  // This seems incorrect
        //     method: 'POST',
        //     contentType: 'application/json',
        //     data: JSON.stringify({ username, password, roleId }),
        //     success: function(response) {
        //         localStorage.setItem('token', response.token);
        //         alert('Login successful!');
  
        //         if (response.user && response.user.UserRole && response.user.UserRole.name === 'Admin') {
        //             window.location.href = '/user';
        //         } else {
        //             window.location.href = '/userrole';
        //         }
        //     },
        //     error: function(err) {
        //         console.error('Login error:', err);
        //         alert('Login failed: ' + (err.responseJSON?.message || 'Unknown error'));
        //     }
        // });
        $.ajax({
            url: '/api/users/login',  // Corrected the endpoint
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password, roleId }),
            success: function(response) {
                localStorage.setItem('token', response.token);
                alert('Login successful!');
        
                if (response.user && response.user.userRoleId === 1) {
                    window.location.href = '/user';  // Redirect to user dashboard or index
                } else {
                    window.location.href = '/index';  // Redirect to role-specific page
                }
            },
            error: function(err) {
                console.error('Login error:', err);
                alert('Login failed: ' + (err.responseJSON?.message || 'Unknown error'));
            }
        });
        
    });
  });
  