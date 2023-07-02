/************* Variables ************** */
const urlParams = new URLSearchParams(window.location.search);
const mealId = urlParams.get('id');
const option = { method: 'GET' };
const mealName = document.querySelector('.name-container h3');
const mealThum = document.querySelector('.image-container img');
const mealArea = document.querySelector('.area-container h3');
const mealCategory = document.querySelector('.category-container h3');
const tagsContainer = document.querySelector('.tags-container');
const youtubeLink = document.querySelector('.youtube-content');
const instructionNode = document.querySelector('.instruction-container');
const ingredContainer = document.querySelector('.indgredient-content');
const headerNavSearch = document.querySelectorAll(
  '.search-alphabetically ul li a'
);

/**********Function calls on page load********** */
renderDOM();

/** Render DOM function to dynamically load the data fetching from API */
async function renderDOM() {
  const data = await fetchMealById(mealId);
  console.log(data.meals[0]);
  mealThum.setAttribute('src', data.meals[0].strMealThumb);
  mealThum.setAttribute('alt', data.meals[0].strMeal);
  mealName.innerHTML = data.meals[0].strMeal;
  mealArea.innerHTML = `<i class='bx bx-area'>&nbsp; ${data.meals[0].strArea}</i>`;
  mealCategory.innerHTML = `<i class='bx bx-category'>&nbsp; ${data.meals[0].strCategory}</i>`;
  if (data.meals[0].strTags == null) {
    const noTag = document.createElement('h3');
    noTag.innerHTML = 'No tags for the meal';
    tagsContainer.appendChild(noTag);
  } else {
    var tagsArr = data.meals[0].strTags;
    tagsArr = tagsArr.split(',');
    tagsArr.forEach((element) => {
      const headingTag = document.createElement('h3');
      headingTag.innerHTML = `<i class='bx bxs-purchase-tag-alt'></i>&nbsp;${element}`;
      tagsContainer.appendChild(headingTag);
    });
  }
  youtubeLink.setAttribute('href', data.meals[0].strYoutube);

  var paraNode = document.createElement('p');
  paraNode.innerHTML = data.meals[0].strInstructions;
  instructionNode.appendChild(paraNode);
  for (let i = 1; i <= 20; i++) {
    const dataRef = data.meals[0];
    if (dataRef[`strIngredient${i}`]) {
      const indgredTag = document.createElement('h4');
      indgredTag.innerHTML =
        dataRef[`strIngredient${i}`] +
        '&nbsp;<span>' +
        dataRef[`strMeasure${i}`] +
        '</span>';
      ingredContainer.appendChild(indgredTag);
    } else {
      break;
    }
  }
}

/** Handles the alphabetical navbar clicks */
for (let i = 0; i < headerNavSearch.length; i++) {
  headerNavSearch[i].addEventListener('click', function (event) {
    event.preventDefault();
    var alphabet = event.target.getAttribute('data-char');
    var url = './index.html#/search?query=' + alphabet;
    sessionStorage.setItem('searchAlpha', alphabet);
    window.location.href = url;
  });
}

/**Fetch the meal using an ID */
async function fetchMealById(mealId) {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`,
      option
    );
    return response.json();
  } catch (error) {
    console.log(error);
  }
}
