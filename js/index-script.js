/*************Selectors*********/
const headerNavSearch = document.querySelectorAll(
  '.search-alphabetically ul li a'
);
const option = { method: 'GET' };
const firstCarouselImgElement = document.querySelector('#firstCarousel img');
const firstCarouselHeadingElement = document.querySelector(
  '#firstCarousel div h3'
);
const carouselElement = document.querySelector('#carousel-ele');
const firstCarouselParaElement = document.querySelector('#firstCarousel div p');
const carouselIndicators = document.querySelector('.carousel-indicators');
const searchInput = document.querySelector('#search-input');
const container = document.querySelector('#data-container');
const searchConatiner = document.querySelector('#search-container');
const mealContainer = document.querySelectorAll('.meal-container');
const loaderContainer = document.querySelector('.loader-container');
const carouselCon = document.querySelector('#carousel-content');
const mainContent = document.querySelector('.main-content');

/************** Variables *************/
let carouselMeals = [];
let categoryArr = [];
let favoriteList = localStorage.getItem('favorites')
  ? JSON.parse(localStorage.getItem('favorites'))
  : [];

/*********Local storage and session storage related operations*********/
/* Fetching the favorites list from local storage on page load */
if (localStorage.getItem('favorites')) {
  favoriteList = JSON.parse(localStorage.getItem('favorites'));
}
/* Fetching the carousel data if present in sesssion storage */
if (
  sessionStorage.getItem('carousel') == null ||
  sessionStorage.getItem('carousel') == undefined
) {
  carouselHandle();
} else {
  carouselMeals = JSON.parse(sessionStorage.getItem('carousel')); // Parse the stored JSON string back to an array
  renderCarsouel(carouselMeals);
}

/************* Events *****************/
window.addEventListener('load', onPageLoad);
searchInput.addEventListener('input', onSearchInputChange);
document.addEventListener('click', clickOnViewMore);
document.addEventListener('click', onClickFavoriteIcon);
/**Handles the event for alphabetical nav search click */
for (let i = 0; i < headerNavSearch.length; i++) {
  headerNavSearch[i].addEventListener('click', function (event) {
    event.preventDefault();

    searchConatiner.innerHTML = '';
    searchInput.value = '';
    var alphabet = event.target.getAttribute('data-char');
    var newURL = '/search?query=' + alphabet;
    window.sessionStorage.setItem('searchAlpha', alphabet);
    window.location.hash = newURL;
    fetchMealByFirstChar(alphabet);
  });
}

/**************** Functions ***************/
/* Handling the content on page loads whether to search alphabetically or load meals by category or input search*/
async function onPageLoad(event) {
  event.preventDefault();
  var checkHiddenClass = container.classList.contains('hidden');
  if (
    this.window.location.hash.includes('search') &&
    window.sessionStorage.getItem('searchAlpha')
  ) {
    if (loaderContainer.classList.contains('hidden') == false) {
      loaderContainer.classList.add('hidden');
      mainContent.classList.remove('hidden');
      if (searchConatiner.classList.contains('hidden')) {
        container.classList.add('hidden');
        searchConatiner.classList.remove('hidden');
      }
    }
    searchConatiner.innerHTML = '';
    if (!checkHiddenClass && searchConatiner.classList.contains('hidden')) {
      container.classList.add('hidden');
      searchConatiner.classList.remove('hidden');
    }
    await fetchMealByFirstChar(window.sessionStorage.getItem('searchAlpha'));
  } else if (searchInput.value.length != 0) {
    searchByName(searchInput.value);
  } else {
    if (mainContent.classList.contains('hidden') == false) {
      mainContent.classList.add('hidden');
      carouselCon.classList.add('hidden');
    }
    this.setTimeout(function () {
      loaderContainer.classList.add('hidden');
      mainContent.classList.remove('hidden');
      carouselCon.classList.remove('hidden');
    }, 5000);

    await mainBodyData();
  }
}
/** Handles the search when user press key in search input box */
async function onSearchInputChange(event) {
  let searchIn = event.target.value;
  //If input length is zero displays the main data meals by category else display the result of input
  if (searchIn.length == 0) {
    if (carouselCon.classList.contains('hidden')) {
      carouselCon.classList.remove('hidden');
    }
    if (container.classList.contains('hidden')) {
      container.classList.remove('hidden');
      searchConatiner.classList.add('hidden');
    }
  } else {
    carouselCon.classList.add('hidden');
    searchByName(searchIn);
  }
}
/**Handles view more click */
async function clickOnViewMore(event) {
  if (event.target.classList.contains('view-more')) {
    const nearestContainer = event.target.closest('.view-more-container');
    searchConatiner.innerHTML = '';
    if (!container.classList.contains('hidden')) {
      container.classList.add('hidden');
      searchConatiner.classList.remove('hidden');
    }
    let data = await fetchByCategory(
      nearestContainer.getAttribute('data-category')
    );
    for (let i = 0; i < data.meals.length; i++) {
      createCard(data.meals[i], searchConatiner);
    }
    detailPageClickEvent();
  }
}
/**Handles the event when user clicks on favorite icon to add or remove meal from favorite */
function onClickFavoriteIcon(event) {
  const clickedEvent = event.target;
  //Handles the addition or removal of meal from favorite list
  if (clickedEvent.classList.contains('favorite-icon')) {
    const favoriteIconId = clickedEvent.getAttribute('data-itemId');
    const cardContainer = clickedEvent.closest('.card');
    if (clickedEvent.classList.contains('bookmark')) {
      clickedEvent.classList.remove('bookmark');
      clickedEvent.classList.remove('bxs-heart');
      clickedEvent.classList.add('bx-heart');
      removeFavorite(favoriteIconId);
    } else {
      addFavorite(favoriteIconId, cardContainer);
      clickedEvent.classList.add('bookmark');
      clickedEvent.classList.add('bxs-heart');
      clickedEvent.classList.remove('bx-heart');
    }
  }
}
/**Renders the carousel images*/
function renderCarsouel(carouselMeals) {
  firstCarouselImgElement.setAttribute('src', carouselMeals[0].mealImage);
  firstCarouselHeadingElement.innerHTML = carouselMeals[0].mealName;
  firstCarouselParaElement.innerHTML = 'Area: ' + carouselMeals[0].mealArea;
  //Render the carousel for all the three images and setup the HTML nodes
  for (let i = 1; i < carouselMeals.length; i++) {
    const outerDiv = document.createElement('div');
    outerDiv.setAttribute('class', 'carousel-item');
    outerDiv.setAttribute('data-bs-interval', '2000');
    const imageNode = document.createElement('img');
    imageNode.setAttribute('src', carouselMeals[i].mealImage);
    imageNode.setAttribute('class', 'd-block w-100');
    imageNode.setAttribute('alt', `${carouselMeals[i].mealName}`);
    const innerDivNode = document.createElement('div');
    innerDivNode.setAttribute('class', 'carousel-caption d-md-block');
    const headingNode = document.createElement('h3');
    headingNode.innerHTML = carouselMeals[i].mealName;
    const paraNode = document.createElement('p');
    paraNode.innerHTML = 'Area: ' + carouselMeals[i].mealArea;
    innerDivNode.appendChild(headingNode);
    innerDivNode.appendChild(paraNode);
    outerDiv.appendChild(imageNode);
    outerDiv.appendChild(innerDivNode);
    carouselElement.appendChild(outerDiv);
  }
}
/**Fetch three random meals to be displayed in carousel */
function carouselHandle() {
  const fetchPromises = [];
  //calls random meal fetch API thrice
  for (let i = 0; i < 3; i++) {
    fetchPromises.push(
      fetchSingleRandomMeal().catch((error) => {
        console.log(error);
      })
    );
  }
  Promise.all(fetchPromises)
    .then((data) => {
      carouselMeals = data;
      sessionStorage.setItem('carousel', JSON.stringify(carouselMeals)); // Convert the array to a JSON string before storing
      renderCarsouel(carouselMeals);
    })
    .catch((error) => {
      console.log(error);
    });
}

/**Function to load homepage */
async function mainBodyData() {
  /**Fetch all the categories */
  if (categoryArr.length == 0) {
    await fetchCategories();
  }
  /**Fetching the meals by category and rendering into the DOM extracting only 5 meals */
  for (let item of categoryArr) {
    var categoryMealContainer = document.createElement('div');
    categoryMealContainer.setAttribute('class', 'categoryMeal');
    categoryMealContainer.setAttribute('id', `${item}`);
    const categoryHeading = document.createElement('h3');
    categoryHeading.innerHTML = item;
    const mealContent = document.createElement('div');
    mealContent.setAttribute('class', 'meal-content-container');
    categoryMealContainer.appendChild(categoryHeading);
    categoryMealContainer.appendChild(mealContent);
    container.appendChild(categoryMealContainer);
    var categoryMealCont = document.querySelector(
      `#${item} .meal-content-container`
    );
    var mealsByCategory = await fetchByCategory(item);
    let mealDishCount;
    if (mealsByCategory.meals.length > 5) {
      mealDishCount = 5;
    } else {
      mealDishCount = mealsByCategory.meals.length;
    }
    for (let i = 0; i < mealDishCount; i++) {
      createCard(mealsByCategory.meals[i], categoryMealCont);
    }
    if (mealsByCategory.meals.length > 5) {
      const viewMoreContainer = document.createElement('div');
      viewMoreContainer.setAttribute('class', 'view-more-container');
      viewMoreContainer.setAttribute('data-category', `${item}`);
      viewMoreContainer.innerHTML =
        "<i class='bx bxs-right-arrow-circle bx-lg view-more' style='color:#748a37'></i><h4 class='view-more'>View More</h4>";
      categoryMealCont.appendChild(viewMoreContainer);
    }
  }
  detailPageClickEvent();
}

/**************** Reusable Functions ***********/
/** Handles click on card to open details page */
function detailPageClickEvent() {
  var mealContainers = document.querySelectorAll('.meal-container');
  mealContainers.forEach((container) => {
    container.addEventListener('click', async function (event) {
      const mealId = this.getAttribute('data-id');
      var url = './details-page.html?id=' + mealId;
      window.location.href = url;
    });
  });
}

/**Resuable function to save data to local storage */
function saveToLocalStorage() {
  localStorage.setItem('favorites', JSON.stringify(favoriteList));
}
/** Reusable function to create the card */
function createCard(data, outerContainer) {
  const divnode = document.createElement('div');
  const innerDivNode = document.createElement('div');
  const nodeimage = document.createElement('img');
  const node = document.createElement('p');
  let favoriteIconType;
  //Dynamically adding the icon for saved card
  if (favoriteList.find((item) => item.mealId === data.idMeal)) {
    favoriteIconType = 'bxs-heart bookmark';
  } else {
    favoriteIconType = 'bx-heart';
  }
  divnode.innerHTML = `<div class='favorite-container'><i class='bx ${favoriteIconType} bx-sm favorite-icon' data-itemId='${data.idMeal}'></i></div>`;
  divnode.setAttribute('class', 'card');
  nodeimage.setAttribute('src', data.strMealThumb);
  nodeimage.setAttribute('class', 'image');
  node.innerText = data.strMeal;
  innerDivNode.setAttribute('class', 'meal-container');
  innerDivNode.setAttribute('data-id', data.idMeal);
  innerDivNode.appendChild(nodeimage);
  innerDivNode.appendChild(node);
  divnode.appendChild(innerDivNode);
  outerContainer.appendChild(divnode);
}
/** Handles the addition of meal to favorites*/
function addFavorite(mealId, cardContainer) {
  const mealThumb = cardContainer.querySelector('.image').getAttribute('src');
  const mealName = cardContainer.querySelector('.meal-container p').innerHTML;
  const meal = {
    mealId,
    strMealThumb: mealThumb,
    strMeal: mealName,
  };
  favoriteList.push(meal);
  console.log('******' + favoriteList);
  saveToLocalStorage();
}
/** Handles the removal of meal to favorites*/
function removeFavorite(mealId) {
  favoriteList = favoriteList.filter((item) => item.mealId !== mealId);
  saveToLocalStorage();
}

/** API calls */
/**API call to fetch meals by categories */
async function fetchByCategory(category) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`,
      option
    );
    return response.json();
  } catch (err) {
    console.log(err);
  }
}

/**API call to fetch all meals categories */
async function fetchCategories() {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/categories.php`,
      option
    );
    const data = await response.json();
    categoryArr = data.categories.map((category) => category.strCategory);
    return categoryArr;
  } catch (err) {
    console.log(err);
  }
}

/**API call to fetch meals input name */
async function searchByName(search) {
  try {
    history.replaceState(
      null,
      document.title,
      window.location.origin + window.location.pathname
    );
    if (!container.classList.contains('hidden')) {
      container.classList.add('hidden');
      searchConatiner.classList.remove('hidden');
    }
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`,
      option
    );

    const data = await response.json();
    searchConatiner.innerHTML = '';
    if (data.meals == null) {
      const innerDiv = document.createElement('div');
      innerDiv.setAttribute('class', 'no-data');
      innerDiv.innerHTML = `<i class='bx bxs-error-alt bx-lg'></i><h2>OOPs! no meals with the name</h2>`;
      searchConatiner.appendChild(innerDiv);
    } else {
      for (let i = 0; i < data.meals.length; i++) {
        createCard(data.meals[i], searchConatiner);
      }
    }
    detailPageClickEvent();
  } catch (err) {
    console.log(err);
  }
}

/**API call to fetch meals by first letter */
let fetchMealByFirstChar = async function (charac) {
  try {
    if (carouselCon.classList.contains('hidden')) {
      carouselCon.classList.remove('hidden');
    }
    if (!container.classList.contains('hidden')) {
      container.classList.add('hidden');
      searchConatiner.classList.remove('hidden');
    }
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${charac}`,
      option
    );
    const data = await response.json();
    for (let i = 0; i < data.meals.length; i++) {
      createCard(data.meals[i], searchConatiner);
    }
    detailPageClickEvent();
  } catch (err) {
    console.log(err);
    return;
  }
};

/**API call to fetch a meal randomly */
async function fetchSingleRandomMeal() {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/random.php`,
      option
    );
    const data = await response.json();
    const carouselData = {
      id: data.meals[0].idMeal,
      mealArea: data.meals[0].strArea,
      mealName: data.meals[0].strMeal,
      mealImage: data.meals[0].strMealThumb,
    };
    return carouselData;
  } catch (err) {
    console.log(err);
    return;
  }
}
