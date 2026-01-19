// =======================
// Quiz App - Refactored JS
// =======================

// -----------------------
// Global State
// -----------------------
const quizState = {
  questions: [],
  currentQuestionIndex: 0,
  userAnswers: [],
  category: "",
  difficulty: "",
};

// -----------------------
// DOM Elements
// -----------------------
const themeToggle = document.querySelector(".theme-toggle");
const categoryCards = document.querySelectorAll(".category-card");
const startButton = document.querySelector(".start-quiz-btn");
const notificationToast = document.querySelector(".notification-toast");
const searchInput = document.querySelector(".search-box input");

const quizPage = document.getElementById("quiz");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-content");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const submitBtn = document.getElementById("submit-quiz");
const currentQuestionElement = document.getElementById("current-question");
const totalQuestionsElement = document.getElementById("total-questions");
const progressFill = document.querySelector(".progress-fill");
const quizCategory = document.getElementById("quiz-category");

// -----------------------
// Theme Toggle
// -----------------------
function initThemeToggle() {
  if (!themeToggle) return;

  themeToggle.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);

    // Update icon safely
    const icon = themeToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-moon");
      icon.classList.toggle("fa-sun");
    }
  });
}

// -----------------------
// Hamburger Menu Toggle
// -----------------------
function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");
  const body = document.body;

  if (!hamburger || !navMenu) return;

  // Toggle menu on hamburger click
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    body.classList.toggle("menu-open");
  });

  // Close menu when clicking on a nav link
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const isClickInsideNav = navMenu.contains(e.target);
    const isClickOnHamburger = hamburger.contains(e.target);

    if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains("active")) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });

  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("active")) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && navMenu.classList.contains("active")) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
      body.classList.remove("menu-open");
    }
  });
}


// -----------------------
// Category Selection
// -----------------------
function initCategorySelection() {
  categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Remove selected class from all cards
      categoryCards.forEach((c) => c.classList.remove("selected"));

      // Add selected class to clicked card
      this.classList.add("selected");

      // Show start button
      startButton.classList.remove("hidden");

      // Show notification
      notificationToast.classList.remove("hidden");

      // Hide notification after 3 seconds
      setTimeout(() => {
        notificationToast.classList.add("hidden");
      }, 3000);
    });
  });
}

// -----------------------
// Search Functionality
// -----------------------
function initSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase();

    categoryCards.forEach((card) => {
      const categoryName = card.querySelector("h3").textContent.toLowerCase();
      card.style.display = categoryName.includes(searchTerm)
        ? "block"
        : "none";
    });
  });
}
// -----------------------
// Routing
// -----------------------
function navigateTo(pageId) {
  // إخفاء جميع الصفحات
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // إظهار الصفحة المطلوبة
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
  }

  // تحديث الرابط في شريط العنوان
  window.location.hash = pageId;

  // تحديث القائمة النشطة
  updateActiveNav(pageId);
}

function updateActiveNav(pageId) {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${pageId}`) {
      link.classList.add("active");
    }
  });
}

function initRouting() {
  // تحديد الصفحة الافتراضية
  const defaultPage = window.location.hash.substring(1) || "home";
  navigateTo(defaultPage);

  // إضافة مستمعي الأحداث لروابط التنقل
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const pageId = this.getAttribute("href").substring(1);
      navigateTo(pageId);
    });
  });

  // الاستماع لتغييرات الهاش في الرابط
  window.addEventListener("hashchange", () => {
    const pageId = window.location.hash.substring(1) || "home";
    navigateTo(pageId);
  });
}
const adminPanel = document.querySelector(".admin-panel");
const app = document.querySelector(".app");

document.querySelector(".admin-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  adminPanel.classList.remove("hidden");
  app.classList.add("hidden");
});

document.querySelector(".back-to-app")?.addEventListener("click", () => {
  adminPanel.classList.add("hidden");
  app.classList.remove("hidden");
});
window.addEventListener("hashchange", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (location.hash === "#admin" && currentUser?.role !== "admin") {
    alert("Access denied");
    navigateTo("home");
  }
});
function updateAdminStats() {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  document.querySelector(".stat-number").textContent = users.length;
}
// -----------------------
// API Fetch
// -----------------------
async function fetchQuestions(category, difficulty, amount = 15) {
  try {
    // تحويل اسم الكاتيجوري إلى ID (يمكن توسيع هذا حسب الحاجة)
    const categoryMap = {
      "history": 23,
      "science": 17,
      "geography": 22,
      "sports": 21,
      "technology": 18,
      "arts": 25
    };

    const categoryId = categoryMap[category] || 9; // 9 هو General Knowledge

    const api_url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    const response = await fetch(api_url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching questions:", error);
    answersContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load questions. Please try again.</p>
        <button class="btn-primary" id="retry-btn">Retry</button>
      </div>
    `;

    document
      .getElementById("retry-btn")
      .addEventListener("click", () => location.reload());

    return [];
  }
}
/*دا الى انا عمله */
/*async function fetchQUestion(category,difficulty,amount = 15) {
 
  
  try{
     const api_url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=multiple`
  const category_map = {
    "history": 23,
    "science": 17,
    "geography": 22,
    "sports": 21,
    "technology": 18,
    "arts": 25
  
  }
  const categoryId = category_map[category] || 9;
    const res = await fetch(api_url)
    if(!res.ok){
      throw new Error("Network response was not ok")
    }
  const data  = await res.json()
  return date.res
}catch(err){
  console.error("Error fetching questions:", err);
  answersContainer.innerHTML = `
      <div class="error-message">
        <p>Failed to load questions. Please try again.</p>
        <button class="btn-primary" id="retry-btn">Retry</button>
      </div>
    `;
    document
    .getElementById("retry-btn")
    .addEventListener("click", () => location.reload());
}*/
// -----------------------
// بدء Quiz جديد
// -----------------------
async function startNewQuiz(category, difficulty, categoryName) {
  quizState.questions = await fetchQuestions(category, difficulty);
  quizState.currentQuestionIndex = 0;
  quizState.userAnswers = new Array(quizState.questions.length).fill(null);
  quizState.category = category;
  quizState.difficulty = difficulty;

  quizCategory.textContent = categoryName;
  totalQuestionsElement.textContent = quizState.questions.length;

  navigateTo("quiz");
  displayCurrentQuestion();
  updateProgressBar();
}

// -----------------------
// عرض السؤال الحالي
// -----------------------
function displayCurrentQuestion() {
  if (quizState.questions.length === 0) return;

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
  questionText.textContent = decodeHtmlEntities(currentQuestion.question);

  // خلط الإجابات
  const allAnswers = shuffleArray([
    ...currentQuestion.incorrect_answers,
    currentQuestion.correct_answer
  ]);

  // عرض الإجابات
  answersContainer.innerHTML = "";
  allAnswers.forEach((answer, index) => {
    const answerElement = document.createElement("div");
    answerElement.className = "answer-option";
    answerElement.innerHTML = `
      <input type="radio" name="answer" id="answer-${index}" value="${answer}">
      <label for="answer-${index}">${decodeHtmlEntities(answer)}</label>
    `;

    // تحديد إذا كانت مختارة قبل كده
    if (quizState.userAnswers[quizState.currentQuestionIndex] === answer) {
      answerElement.querySelector("input").checked = true;
    }

    // تحديث الإجابة عند التغيير
    answerElement.querySelector("input").addEventListener("change", (e) => {
      quizState.userAnswers[quizState.currentQuestionIndex] = e.target.value;
    });

    answersContainer.appendChild(answerElement);
  });

  updateNavigationButtons();
}

// -----------------------
// أزرار التنقل
// -----------------------
function updateNavigationButtons() {
  prevBtn.disabled = quizState.currentQuestionIndex === 0;

  if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
    nextBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    submitBtn.classList.add("hidden");
  }
}

// -----------------------
// شريط التقدم
// -----------------------
function updateProgressBar() {
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
  progressFill.style.width = `${progress}%`;
  currentQuestionElement.textContent = quizState.currentQuestionIndex + 1;
}

// -----------------------
// التنقل بين الأسئلة
// -----------------------
function goToNextQuestion() {
  if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
    quizState.currentQuestionIndex++;
    displayCurrentQuestion();
    updateProgressBar();
  }
}

function goToPreviousQuestion() {
  if (quizState.currentQuestionIndex > 0) {
    quizState.currentQuestionIndex--;
    displayCurrentQuestion();
    updateProgressBar();
  }
}

// -----------------------
// تقديم الكويز
// -----------------------
function submitQuiz() {
  let correctCount = 0;

  quizState.questions.forEach((question, index) => {
    if (quizState.userAnswers[index] === question.correct_answer) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / quizState.questions.length) * 100);

  document.getElementById("score-percentage").textContent = `${scorePercentage}%`;
  document.getElementById("correct-answers").textContent = correctCount;
  document.getElementById("total-answers").textContent = quizState.questions.length;

  const scoreCircle = document.querySelector(".score-circle");
  scoreCircle.style.background = `conic-gradient(var(--primary-color) ${scorePercentage}%, #e9ecef ${scorePercentage}%)`;

  navigateTo("results");
}

// -----------------------
// Utilities
// -----------------------
function decodeHtmlEntities(text) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = text;
  return textArea.value;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -----------------------
// Scroll Animations
// -----------------------
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".scroll-animate").forEach((el) => {
    observer.observe(el);
  });
}

// -----------------------
// Auth UI Handling
// -----------------------
function updateAuthUI() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const loginBtn = document.querySelector(".login-btn");
  const signupBtn = document.querySelector(".signup-btn");
  const userMenu = document.querySelector(".user-menu");
  const userNameDisplay = document.querySelector(".user-name");
  const adminLink = document.querySelector(".admin-link");

  if (currentUser) {
    if (loginBtn) loginBtn.parentElement.classList.add("hidden");
    if (signupBtn) signupBtn.parentElement.classList.add("hidden");
    if (userMenu) {
      userMenu.classList.remove("hidden");
      if (userNameDisplay) userNameDisplay.textContent = currentUser.name || "User";
    }

    if (currentUser.role === "admin") {
      if (adminLink) adminLink.classList.remove("hidden");
    } else {
      // Also hide for non-admins if invalidly shown
      if (adminLink) adminLink.classList.add("hidden");
    }

  } else {
    if (loginBtn) loginBtn.parentElement.classList.remove("hidden");
    if (signupBtn) signupBtn.parentElement.classList.remove("hidden");
    if (userMenu) userMenu.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden"); // Ensure admin link is hidden if no user
  }
}

// -----------------------
// App Init
// -----------------------
function initApp() {
  initThemeToggle();
  initHamburgerMenu();
  initScrollAnimations();
  initCategorySelection();
  initSearch();
  initRouting();
  updateAuthUI();

  // Logout Handler
  const logoutLink = document.querySelector('a[href="#logout"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      updateAuthUI();
      navigateTo("home");
      const toast = document.querySelector(".notification-toast");
      toast.innerHTML = '<i class="fas fa-check-circle"></i> Logged out successfully';
      toast.classList.add("active");
      setTimeout(() => {
        toast.classList.remove("active");
      }, 3000);
    });
  }

  // أزرار التنقل
  nextBtn.addEventListener("click", goToNextQuestion);
  prevBtn.addEventListener("click", goToPreviousQuestion);
  submitBtn.addEventListener("click", submitQuiz);
  document.getElementById("retry-quiz").addEventListener("click", () => navigateTo("home"));

  // بطاقات الكاتيجوري
  categoryCards.forEach(card => {
    card.addEventListener("click", () => {
      const category = card.dataset.category;
      const difficulty = "medium"; // default
      const categoryName = card.querySelector("h3").textContent;
      startNewQuiz(category, difficulty, categoryName);
    });
  });
}

// Run app
document.addEventListener("DOMContentLoaded", initApp);
//HAShing password
// يحوّل ArrayBuffer إلى Hex string
function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
// يولّد salt عشوائي (طوله bytes)
function generateSalt(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, byte => byte.toString(16).padStart(2, '0')).join('');
}
// هاش SHA-256 على النص (مع إمكانية إضافة salt كبادئة)
// ترجع hex string
async function hashPasswordSHA256(password, salt = '') {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password); // salt + password
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}
//login for admin
//login for admin
(async function seeAdmin() {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const adminIndex = users.findIndex(user => user.role === "admin");

  // Check if admin needs to be created or updated (if missing hash)
  if (adminIndex === -1 || !users[adminIndex].hashedPassword) {
    const salt = generateSalt(16);
    const hashedPassword = await hashPasswordSHA256("admin", salt);

    const newAdmin = {
      name: "Admin",
      username: "admin",
      email: "admin@admin.com",
      hashedPassword: hashedPassword,
      salt: salt,
      role: "admin",
      createdAt: new Date().toISOString()
    };

    if (adminIndex === -1) {
      users.push(newAdmin);
    } else {
      // Update existing invalid admin
      users[adminIndex] = newAdmin;
    }

    localStorage.setItem("users", JSON.stringify(users));
    console.log("Admin user seeded/updated successfully.");
  }
})()
// Login Form Submission validate
const loginForm = document.getElementById("login-form");
const errorsMessageLogin = document.getElementById("errors-messge-login");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loginUsernameInput = document.getElementById("login-username").value.trim();
  const loginPasswordInput = document.getElementById("login-password").value.trim();

  let messages = [];

  if (!loginUsernameInput || !loginPasswordInput) {
    messages.push("Please fill in all fields");
  } else {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    // Check for username (if stored), email, or name
    const userData = users.find(u =>
      (u.username && u.username.toLowerCase() === loginUsernameInput.toLowerCase()) ||
      (u.email && u.email.toLowerCase() === loginUsernameInput.toLowerCase()) ||
      (u.name && u.name.toLowerCase() === loginUsernameInput.toLowerCase())
    );

    if (!userData) {
      messages.push("User not found");
    } else {
      // hash login password
      const loginPasswordHash = await hashPasswordSHA256(loginPasswordInput, userData.salt);

      if (loginPasswordHash !== userData.hashedPassword) {
        messages.push("Incorrect password");
      } else {
        showMessage(errorsMessageLogin, "Login successful 🎉 Redirecting...", "success");

        // Save current user session
        localStorage.setItem("currentUser", JSON.stringify(userData));
        updateAuthUI();

        return; // نوقف الكود عشان منعرضش error
      }
    }
  }
  // عرض الرسائل لو فيه errors
  if (messages.length > 0) {
    showMessage(errorsMessageLogin, messages.join(", "), "error");
  }
});
function showMessage(element, message, type = "error") {
  element.textContent = message;
  element.className = `message-box ${type}`;
  element.style.display = "block";

  if (type === "success") {
    let counter = 4;

    const interval = setInterval(() => {
      element.textContent = `Login successful ✅ — Please wait ${counter}s to go to Home`;
      counter--;

      if (counter < 0) {
        clearInterval(interval); // نوقف العداد
        element.style.display = "none";
        element.textContent = "";
        navigateTo("home"); // نحول بعد انتهاء العد
      }
    }, 1000); // يعدل الرسالة كل ثانية
  } else {
    // لو رسالة خطأ
    setTimeout(() => {
      element.style.display = "none";
      element.textContent = "";
    }, 4000);
  }
}

//singup form Submission validate
const signupForm = document.getElementById("signup-form");
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const confirmPassword = document.getElementById("signup-confirm-password").value.trim();
  const terms = document.getElementById("terms-agree").checked;
  const phone = document.getElementById("signup-phone").value.trim();
  const birthdate = document.getElementById("signup-birthdate").value.trim();
  document.querySelectorAll(".error").forEach(el => el.textContent = "");


  // validate name
  if (!name) document.getElementById("name-error").textContent = "Please enter your name";

  // validate email
  if (!email) document.getElementById("email-error").textContent = "Please enter your email";
  const emailpattern = /^[^]+@[^]+\.[a-zA-Z]{2,3}$/;
  if (email && !emailpattern.test(email)) document.getElementById("email-error").textContent = "Please enter a valid email address";

  // validate password
  if (!password) document.getElementById("password-error").textContent = "Please enter your password";
  const passwordstrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (password && !passwordstrong.test(password)) document.getElementById("password-error").textContent = "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";

  // validate confirm password
  if (!confirmPassword) document.getElementById("confirm-password-error").textContent = "Please confirm your password";
  if (password !== confirmPassword) document.getElementById("confirm-password-error").textContent = "Passwords do not match";

  // validate terms
  if (!terms) document.getElementById("terms-error").textContent = "You must agree to the Terms and Conditions";

  // validate phone
  const phonepattern = /^(?:01[0-2]|015)[0-9]{8}$|^(?:\+201[0-2]|\\+2015)[0-9]{8}$/;
  if (!phone) document.getElementById('phone-error').textContent = "Please enter your phone number";
  if (phone && !phonepattern.test(phone)) document.getElementById('phone-error').textContent = "phone number must have 11 digits";

  // validate birthdate
  if (!birthdate) {
    document.getElementById('birthdate-error').textContent = "Please enter your birthdate";
  } else {
    const today = new Date();
    const userbirthdate = new Date(birthdate);
    if (userbirthdate > today) document.getElementById('birthdate-error').textContent = "Birthdate cannot be in the future";
  }

  // validate gender
  const gender = document.querySelector('input[name="gender"]:checked');
  if (!gender) document.getElementById("gender-error").textContent = "Please select your gender";

  if (document.querySelectorAll(".error:not(:empty)").length > 0) return;

  // Check LocalStorage

  const emailNormalized = email.toLowerCase();
  let user = JSON.parse(localStorage.getItem("users")) || [];
  const userExists = user.some(u => u.email === emailNormalized);
  if (userExists) {
    document.getElementById("email-error").textContent = "Email already exists";
    return;
  }

  // generate salt and hash password
  const salt = generateSalt(16);
  const passwordHash = await hashPasswordSHA256(password, salt);

  // Store user data
  const userData = {
    role: "user",
    username: name,
    name: name,
    email: emailNormalized,
    hashedPassword: passwordHash,
    salt,
    phone,
    birthdate,
    gender: gender ? gender.value : "",
    createdAt: new Date().toISOString()
  };

  user.push(userData);
  localStorage.setItem("users", JSON.stringify(user));

  // Success message and redirect
  const errorBox = document.getElementById("errors-messge-signup");
  errorBox.className = "toast success show";
  errorBox.textContent = "✅ Account created successfully! Redirecting to login...";
  signupForm.reset();

  // Navigate to login after 2 seconds
  setTimeout(() => {
    errorBox.classList.remove("show");
    errorBox.textContent = "";
    navigateTo("login");
  }, 2000);

});

// advanced logic for password
const passwordInput = document.getElementById("signup-password");
const strengthBar = document.querySelector(".strength-bar");
const strengthText = document.querySelector(".strength-text");

passwordInput.addEventListener("input", () => {
  const value = passwordInput.value;
  let strength = 0;

  if (/[a-z]/.test(value)) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/[0-9]/.test(value)) strength++;
  if (/[@$!%*?&]/.test(value)) strength++;
  if (value.length >= 8) strength++;

  // حساب العرض
  const width = (strength / 5) * 100;
  strengthBar.style.width = `${width}%`;

  // اللون تدريجي باستخدام HSL من أحمر (0deg) إلى أخضر (120deg)
  const hue = (strength / 5) * 120;
  strengthBar.style.backgroundColor = `hsl(${hue}, 80%, 50%)`;

  // النص حسب القوة
  if (strength === 5) {
    strengthText.textContent = "Strong";
    strengthText.style.color = `hsl(${hue}, 80%, 40%)`;
  } else if (strength >= 3) {
    strengthText.textContent = "Medium";
    strengthText.style.color = `hsl(${hue}, 80%, 40%)`;
  } else {
    strengthText.textContent = "Weak";
    strengthText.style.color = `hsl(${hue}, 80%, 40%)`;
  }
});
//contact page
//validate contact form
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const message = document.getElementById('message').value;
  const subject = document.getElementById('contact-subject')
  if (!name) return document.getElementById('contact-name-error').textContent = "Please enter your name";
  if (!email) return document.getElementById('contact-email-error').textContent = "Please enter your email";
  const emailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (email && !emailpattern.test(email)) return document.getElementById('contact-email-error').textContent = "Please enter a valid email address";
  const phonepattern = /^(?:01[0-2]|015)[0-9]{8}$|^(?:\+201[0-2]|\\+2015)[0-9]{8}$/;
  if (phone && !phonepattern.test(phone)) return document.getElementById('contact-phone-error').textContent = "Please enter a valid phone number";
  if (!phone) return document.getElementById('contact-phone-error').textContent = "Please enter your phone number";
  if (!phonepattern.test(phone)) return document.getElementById('contact-phone-error').textContent = "Please enter a valid phone number";
  if (!message) return document.getElementById('contact-message-error').textContent = "Please enter your message";
  if (!subject) return document.getElementById('contact-subject-error').textContent = "please selcet your subject"
  // send email
  email.send({
    Host: "smtp.elasticemail.com",
    Username: "elgendy123456789@gmail.com",
    Password: "D2F2F2F2F2F2F2F2F2F2F2F2F2F2F2F2F2F2",
    To: 'elgendy123456789@gmail.com',
    From: email,
    Subject: `Contact Form Submission from ${name}`,
    Body: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
  }).then(
    message => alert(message),
    error => alert(error)
  );
  // reset form
  document.getElementById('contact-form').reset();
  document.getElementById('contact-form').classList.remove('error');
})
// FAQ Accordion Logic
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const chevronDown = item.querySelector(".fa-chevron-down");
  const answer = item.querySelector(".faq-answer");

  // Add click event to the entire question header, not just the icon
  question.addEventListener("click", () => {
    chevronDown.classList.toggle("rotate");
    answer.classList.toggle("show");

    // Auto-close after 5 seconds if opened
    if (answer.classList.contains("show")) {
      setTimeout(() => {
        chevronDown.classList.remove("rotate");
        answer.classList.remove("show");
      }, 10000);
    }
  });
});

