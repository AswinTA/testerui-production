var accessToken = localStorage.getItem("authtoken");
var base64Url = accessToken.split('.')[1];
var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
var jwtContent = JSON.parse(window.atob(base64));
$('.profile_info h2').text(jwtContent.name);
$('.user-profile p').text(jwtContent.name);
$('.user-profile').addClass("inline-divs");
$('.user-profile').children().addClass("inline-divs");
if (jwtContent.exp < Date.now() / 1000) {
    localStorage.clear();
    window.location.href = "login.html";
}