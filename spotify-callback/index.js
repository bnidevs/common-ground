const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');

window.location.href = `https://bnidevs.github.io/common-ground/?code=${code}`;