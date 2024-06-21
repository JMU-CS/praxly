let modal;
let featuresButton;
let changelogButton;
let bugButton;
let githubButton;
let peopleButton;

modal = document.getElementById("myModal");
featuresButton = document.getElementById('FeaturesButton');
changelogButton = document.getElementById('ChangelogButton');
bugButton = document.getElementById("BugButton");
githubButton = document.getElementById('GitHubButton');
peopleButton = document.getElementById('PeopleButton');

// When the user clicks the button, open the modal
infoButton.onclick = function () {
  setLight();
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
  manual.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal || event.target == manual) {
    modal.style.display = "none";
    manual.style.display = "none";
  }
}

featuresButton.addEventListener('click', function () {
  window.open("features.html", '_blank');
});

changelogButton.addEventListener('click', function () {
  window.open("changelog.html", '_blank');
});

bugButton.addEventListener('click', function () {
  window.open("BugsList.html", '_blank');
});

githubButton.addEventListener('click', function () {
  window.open("https://github.com/JMU-CS/praxly", '_blank');
});

peopleButton.addEventListener('click', function () {
  window.open('people.html');
});
