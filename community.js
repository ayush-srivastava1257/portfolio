document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authContainer = document.getElementById('auth-container');
    const communityFeed = document.getElementById('community-feed');
    const switchAuthElements = document.querySelectorAll('.switch-auth');
    const logoutBtn = document.getElementById('logout-btn');
    const postBtn = document.getElementById('post-btn');
    const postContent = document.getElementById('post-content');
    const postImage = document.getElementById('post-image');
    const imageName = document.getElementById('image-name');
    const postsContainer = document.getElementById('posts-container');
    const themeSwitch = document.getElementById('theme-switch');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const API_BASE_URL = 'http://localhost:5000'; // Add this line

    // State
    let currentUser = null;
    let selectedImage = null;

    // Initialize
    checkAuthStatus();
    setupEventListeners();

    function setupEventListeners() {
        // Switch between login and signup forms
        switchAuthElements.forEach(element => {
            element.addEventListener('click', toggleAuthForms);
        });

        // Login form submission
        document.getElementById('login-form-submit').addEventListener('submit', handleLogin);

        // Signup form submission
        document.getElementById('signup-form-submit').addEventListener('submit', handleSignup);

        // Logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Post creation
        if (postBtn) {
            postBtn.addEventListener('click', createPost);
        }

        // Image selection
        if (postImage) {
            postImage.addEventListener('change', handleImageSelect);
        }

        // Theme toggle
        if (themeSwitch) {
            themeSwitch.addEventListener('change', toggleTheme);
            // Load saved theme preference
            const savedTheme = localStorage.getItem('darkMode') === 'true';
            themeSwitch.checked = savedTheme;
            if (savedTheme) document.body.classList.add('dark-mode');
        }

        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }

    function toggleAuthForms(e) {
        e.preventDefault();
        loginForm.classList.toggle('hidden');
        signupForm.classList.toggle('hidden');
        // Clear errors when switching forms
        document.getElementById('login-error').textContent = '';
        document.getElementById('signup-error').textContent = '';
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
    
        // Basic input validation
        if (!email || !password) {
            errorElement.textContent = 'Email and password are required';
            return;
        }
    
        try {
            console.log('Attempting login with:', { email }); // Debug log
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
    
            console.log('Response status:', response.status); // Debug log
            const data = await response.json();
            console.log('Response data:', data); // Debug log
    
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
    
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            authContainer.classList.add('hidden');
            communityFeed.classList.remove('hidden');
            currentUser = data.user;
            loadPosts();
        } catch (error) {
            console.error('Login error:', error);
            errorElement.textContent = error.message;
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const errorElement = document.getElementById('signup-error');

        // Basic validation
        if (password !== confirmPassword) {
            errorElement.textContent = 'Passwords do not match';
            return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            // Save token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update UI
            authContainer.classList.add('hidden');
            communityFeed.classList.remove('hidden');
            currentUser = data.user;
            loadPosts();
        } catch (error) {
            errorElement.textContent = error.message;
            console.error('Signup error:', error);
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        authContainer.classList.remove('hidden');
        communityFeed.classList.add('hidden');
        currentUser = null;
        // Reset forms
        document.getElementById('login-form-submit').reset();
        document.getElementById('signup-form-submit').reset();
    }

    function handleImageSelect(e) {
        if (e.target.files.length > 0) {
            selectedImage = e.target.files[0];
            imageName.textContent = selectedImage.name;
        } else {
            selectedImage = null;
            imageName.textContent = '';
        }
    }

    async function createPost() {
        if (!postContent.value.trim() && !selectedImage) {
            alert('Please add some content or an image to your post');
            return;
        }

        const formData = new FormData();
        formData.append('content', postContent.value.trim());
        if (selectedImage) formData.append('image', selectedImage);

        try {
            const token = localStorage.getItem('token');
            postBtn.disabled = true;
            postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

            const response = await fetch(`${API_BASE_URL}/api/posts`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}` 
                // Remove 'Content-Type' for FormData
              },
              body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const post = await response.json();
            // Add the new post to the top of the feed
            const postElement = createPostElement(post);
            postsContainer.prepend(postElement);
            
            // Reset form
            postContent.value = '';
            postImage.value = '';
            selectedImage = null;
            imageName.textContent = '';
        } catch (error) {
            console.error('Post creation error:', error);
            alert('Failed to create post: ' + error.message);
        } finally {
            postBtn.disabled = false;
            postBtn.textContent = 'Post';
        }
    }

    async function loadPosts() {
        try {
          postsContainer.innerHTML = '<div class="loading"></div>';
          
          const response = await fetch(`${API_BASE_URL}/api/posts`);
          if (!response.ok) {
            throw new Error('Failed to load posts');
          }
          
          const data = await response.json();
          console.log('Posts data received:', data); // Debug log
          
          // Handle the paginated response structure
          const posts = data.posts || data; // Adjust based on actual response
          postsContainer.innerHTML = '';
          
          if (!posts || posts.length === 0) {
            postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to post!</p>';
            return;
          }
          
          posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
          });
        } catch (error) {
          console.error('Error loading posts:', error);
          postsContainer.innerHTML = `<p class="error">Error loading posts: ${error.message}</p>`;
        }
      }
    function createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.dataset.id = post._id;
        
        // Format date
        const postDate = new Date(post.createdAt).toLocaleString();
        
        // Create avatar with first letter of username
        const avatarLetter = post.user.username.charAt(0).toUpperCase();
        
        // Create post HTML
        postDiv.innerHTML = `
            <div class="post-header">
                <div class="post-user-avatar">${avatarLetter}</div>
                <div class="post-user-info">
                    <div class="post-username">${post.user.username}</div>
                    <div class="post-date">${postDate}</div>
                </div>
            </div>
            ${post.content ? `<div class="post-content">${post.content}</div>` : ''}
            ${post.image ? `
                <div class="post-image-container">
                    <img src="/${post.image}" alt="Post image" class="post-image">
                </div>
            ` : ''}
            <div class="post-stats">
                ${post.likes.length} likes • ${post.comments.length} comments
            </div>
            <div class="post-actions">
                <button class="post-action-btn like-btn">
                    <i class="fas fa-heart"></i> Like
                </button>
                <button class="post-action-btn comment-btn">
                    <i class="fas fa-comment"></i> Comment
                </button>
            </div>
            <div class="comments-container">
                ${post.comments.map(comment => `
                    <div class="comment">
                        <div class="comment-avatar">${comment.user.username.charAt(0).toUpperCase()}</div>
                        <div class="comment-content">
                            <div class="comment-username">${comment.user.username}</div>
                            <div class="comment-text">${comment.text}</div>
                        </div>
                    </div>
                `).join('')}
                <div class="add-comment">
                    <input type="text" class="comment-input" placeholder="Write a comment...">
                </div>
            </div>
        `;
        
        // Add event listeners
        const likeBtn = postDiv.querySelector('.like-btn');
        const commentInput = postDiv.querySelector('.comment-input');
        
        likeBtn.addEventListener('click', () => likePost(post._id, likeBtn));
        commentInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && commentInput.value.trim()) {
                addComment(post._id, commentInput);
            }
        });
        
        return postDiv;
    }

    async function likePost(postId, likeBtn) {
        try {
            const token = localStorage.getItem('token');
            likeBtn.disabled = true;
            likeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to like post');
            }
            
            const updatedPost = await response.json();
            // Update like count
            const postElement = document.querySelector(`.post[data-id="${postId}"]`);
            if (postElement) {
                const statsElement = postElement.querySelector('.post-stats');
                statsElement.textContent = `${updatedPost.likes.length} likes • ${updatedPost.comments.length} comments`;
            }
        } catch (error) {
            console.error('Error liking post:', error);
            alert('Failed to like post: ' + error.message);
        } finally {
            likeBtn.disabled = false;
            likeBtn.innerHTML = '<i class="fas fa-heart"></i> Like';
        }
    }

    async function addComment(postId, commentInput) {
        const commentText = commentInput.value.trim();
        if (!commentText) return;
        
        try {
            const token = localStorage.getItem('token');
            commentInput.disabled = true;
            
            const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add comment');
            }
            
            const updatedPost = await response.json();
            // Update comments section
            const postElement = document.querySelector(`.post[data-id="${postId}"]`);
            if (postElement) {
                const commentsContainer = postElement.querySelector('.comments-container');
                const newComment = updatedPost.comments[updatedPost.comments.length - 1];
                
                const commentDiv = document.createElement('div');
                commentDiv.className = 'comment';
                commentDiv.innerHTML = `
                    <div class="comment-avatar">${currentUser.username.charAt(0).toUpperCase()}</div>
                    <div class="comment-content">
                        <div class="comment-username">${currentUser.username}</div>
                        <div class="comment-text">${newComment.text}</div>
                    </div>
                `;
                
                // Insert before the add-comment div
                const addCommentDiv = postElement.querySelector('.add-comment');
                commentsContainer.insertBefore(commentDiv, addCommentDiv);
                
                // Update stats
                const statsElement = postElement.querySelector('.post-stats');
                statsElement.textContent = `${updatedPost.likes.length} likes • ${updatedPost.comments.length} comments`;
                
                // Clear input
                commentInput.value = '';
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment: ' + error.message);
        } finally {
            commentInput.disabled = false;
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        // Save preference
        localStorage.setItem('darkMode', themeSwitch.checked);
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            authContainer.classList.add('hidden');
            communityFeed.classList.remove('hidden');
            currentUser = user;
            loadPosts();
        }
    }
});