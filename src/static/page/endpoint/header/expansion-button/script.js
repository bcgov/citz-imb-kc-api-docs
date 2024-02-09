document.addEventListener("DOMContentLoaded", function () {
  var expandButtons = document.querySelectorAll(".expand-arrow-button");

  expandButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var detailsId = this.getAttribute("data-index");
      var details = document.getElementById("details-" + detailsId);
      var svgs = this.querySelectorAll(".arrow-svg");

      // Toggle details visibility
      var isDisplayed = details.style.display === "block";
      details.style.display = isDisplayed ? "none" : "block";

      // Switch SVG visibility
      svgs[0].style.display = isDisplayed ? "block" : "none";
      svgs[1].style.display = isDisplayed ? "none" : "block";
    });
  });
});
