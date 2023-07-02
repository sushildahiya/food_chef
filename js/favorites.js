/********* Variabels ********* */
let favoriteList = [];
const container = document.querySelector('#data-container');
const headerNavSearch = document.querySelectorAll(
  '.search-alphabetically ul li a'
);

/**********Fetching data from localstorage when page loads***********/
if (localStorage.getItem('favorites')) {
  favoriteList = JSON.parse(localStorage.getItem('favorites'));
}

/*********** Events ************** */
window.addEventListener('load', function (event) {
  renderFavorites();
});
document.addEventListener('click', handleFavoriteIconClick);

/**Handles the click on favorite icon to remove meal from favorites */
function handleFavoriteIconClick(event) {
  const clickedEvent = event.target;
  if (clickedEvent.classList.contains('favorite-icon')) {
    const favoriteIconId = clickedEvent.getAttribute('data-itemId');
    const cardContainer = clickedEvent.closest('.card');
    if (clickedEvent.classList.contains('bookmark')) {
      clickedEvent.classList.remove('bookmark');
      clickedEvent.classList.remove('bxs-heart');
      clickedEvent.classList.add('bx-heart');
      removeFavorite(favoriteIconId);
    }
  }
}
/** Handles the rendering of favorite meals list */
function renderFavorites() {
  container.innerHTML = '';
  if (favoriteList.length == 0) {
    const addHead = document.createElement('h2');
    addHead.innerHTML =
      'No meal is added as favorite. Please add your favorite meal.';
    container.appendChild(addHead);
  } else {
    favoriteList.forEach((item) => {
      createCard(item, container);
    });
    var mealContainers = document.querySelectorAll('.meal-container');
    detailPageClickEvent(mealContainers);
  }
}

/**Handles the click on meal card to show details page */
function detailPageClickEvent(mealContainers) {
  mealContainers.forEach((container) => {
    container.addEventListener('click', async function (event) {
      const mealId = this.getAttribute('data-id');
      var url = './details-page.html?id=' + mealId;
      window.location.href = url;
    });
  });
}

/** Function to save data local storage */
function saveToLocalStorage() {
  localStorage.setItem('favorites', JSON.stringify(favoriteList));
}
/** Function to handle removal of meal from favorites */
function removeFavorite(mealId) {
  favoriteList = favoriteList.filter((item) => item.mealId !== mealId);
  saveToLocalStorage();
  renderFavorites();
}

/**Handling the click on alphabetical nav bar search */
for (let i = 0; i < headerNavSearch.length; i++) {
  headerNavSearch[i].addEventListener('click', function (event) {
    event.preventDefault();
    var alphabet = event.target.getAttribute('data-char');
    var url = './index.html#/search?query=' + alphabet;
    sessionStorage.setItem('searchAlpha', alphabet);
    window.location.href = url;
  });
}

/**Reusable function to create card in DOM */
function createCard(data, outerContainer) {
  const divnode = document.createElement('div');
  const innerDivNode = document.createElement('div');
  const nodeimage = document.createElement('img');
  const node = document.createElement('p');
  let favoriteIconType;
  if (favoriteList.find((item) => item.mealId === data.mealId)) {
    favoriteIconType = 'bxs-heart bookmark';
  } else {
    favoriteIconType = 'bx-heart';
  }
  divnode.innerHTML = `<div class='favorite-container'><i class='bx ${favoriteIconType} bx-sm favorite-icon' data-itemId='${data.mealId}'></i></div>`;
  divnode.setAttribute('class', 'card');
  nodeimage.setAttribute('src', data.strMealThumb);
  nodeimage.setAttribute('class', 'image');
  node.innerText = data.strMeal;
  innerDivNode.setAttribute('class', 'meal-container');
  innerDivNode.setAttribute('data-id', data.mealId);
  innerDivNode.appendChild(nodeimage);
  innerDivNode.appendChild(node);
  divnode.appendChild(innerDivNode);
  outerContainer.appendChild(divnode);
}
