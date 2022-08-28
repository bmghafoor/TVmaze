const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

let arr2 = []
async function getShowsByTerm(term){
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
  console.log(res.data.length)

  let arr = []
  
  async function hasImage(term, num){
    const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`)
    if(res.data[num].show.image === null){
      return 'https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300'
    }
    else{return res.data[num].show.image.original}
  }

  for(let i =0; i < res.data.length; i++){
    arr.push({
      id: res.data[i].show.id,
      name: res.data[i].show.name,
      summary: res.data[i].show.summary,
      image: await hasImage(term, i)
    })
  }


  console.log(arr)
  arr2 = arr
  return arr
}
/** Given list of shows, create markup for each and to DOM */

function populateShows(array) {
  $showsList.empty();

  for (let i=0; i < array.length; i++) {
    const $show = $(
        `<div data-show-id="${array[i].id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${array[i].image}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${array[i].name}</h5>
             <div><small>${array[i].summary}</small></div>
             <button class="btn1" id=${i}>Episodes</button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const search = document.getElementById('searchTerm')
  console.log(`term is ${search.value}`)
  const shows = await getShowsByTerm(search.value);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const seasons = await axios.get(`https://api.tvmaze.com/shows/${id}/seasons`)
  let episodes = []
  for(let i =0; i < seasons.data.length; i++){
    const episodeList = await axios.get(`https://api.tvmaze.com/seasons/${seasons.data[i].id}/episodes`)
    episodes.push(episodeList.data)
  }
  return episodes
 }

/** Write a clear docstring for this function... */

$(document).on('click','.btn1',populateEpisodes)

$(document).on('click','#closeBtn',function(){
  const modal = document.getElementById('modal')
  modal.style.transform = 'scale(0)'

})

async function populateEpisodes(evt) { 
  const epi = await getEpisodesOfShow(`${arr2[evt.target.id].id}`)
  const modal = document.getElementById('modal')
  const modalTitle = document.getElementById('modalTitle')
  const modalBody = document.getElementById('modalBody')
  modalBody.innerHTML = ''
  let newUl = document.createElement('ul')
  modalBody.append(newUl)
  modal.style.transform = 'translate(-50%, -50%) scale(1)'
  modalTitle.innerHTML = "Seasons and Episodes"
  for(let i =0; i < epi.length; i++){
    for(let j =0; j < epi[i].length; j++){
      let newLi = document.createElement('li')
      newLi.innerHTML = (`Season ${epi[i][j].season} Episode ${epi[i][j].number} ${epi[i][j].name}`)
      newUl.append(newLi)
    }
  }
}
