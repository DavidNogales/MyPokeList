let userInfo = {
    id : "",
    email : "",
    name : "guest",
    favorites: []
};
let id = 1;
let favoritePokemonToDisplay = [];
let showFavorites = false;
let currentPokemon;
window.onload = ()=>{
    let userEmail = sessionStorage.getItem('userEmail');
    if(userEmail){
        let favorites = JSON.parse(sessionStorage.getItem('userFavorites'));
        userInfo.id = sessionStorage.getItem('userID');
        userInfo.email = userEmail;
        userInfo.name = userEmail.split("@")[0];
        userInfo.favorites = favorites;
        console.log(favorites);
    }
    $("#user").text(userInfo.name);
    axiosGetPokemon(`/${id}`);
    getFavorites(userInfo.favorites);
};

$(".logout-link").on("click",async ()=>{
    try {
        if (userInfo.name!=="guest") {
            const myDbUrl  = `https://dnp-api-db.herokuapp.com/users/${userInfo.id}`;
            const {status} = await axios.patch(myDbUrl,{favorites: userInfo.favorites});
            console.log(`Status ${status}`);
        }
        sessionStorage.clear();
        self.location = "./index.html";

    } catch (error) {
        console.log(`Something weird just happened: ${error}`);
    }
});


$("#show").on("click",()=>{
    if (!showFavorites) {
        injectNewFavorites();
        $("#show").text("Hide Favorites!");
        $('#cards-wrapper').slideDown(1000);
        
    }
    else{
        $("#show").text("Show Favorites!");
        $('#cards-wrapper').slideUp(1000);

    }
    showFavorites = !showFavorites;
});

function getFavorites(pkFavs){
    pkFavs.map( async (favPokemon) =>{
        let {data} = await pokemonAxios.get(`pokemon/${favPokemon}`);
        favoritePokemonToDisplay.push(getPokemonCardInfo(data));
    });
}

function getPokemonCardInfo(data){
    const title = data.name;
    const img = data.sprites.front_default;
    const stats = data.stats.map(characteristic=>{
        const desc = `
            <h6> <b>${characteristic.stat.name}</b>: ${characteristic.base_stat} </h6>
        `;
        return desc;
    });
    description = stats.join("");
    return {title,img,description};
}


let pokemonAxios = axios.create({
    baseURL: "https://pokeapi.co/api/v2/"
});

let nextAx=document.getElementById("next-ax");     
nextAx.addEventListener('click', axiosGetNextPokemon);

let prevAx=document.getElementById("prev-ax");      
prevAx.addEventListener('click', axiosGetPreviousPokemon);

let searchBtn=document.getElementById("input-btn");   
searchBtn.addEventListener('click',searchPokemon);

$('#input-text').keydown(function(event) {
    if (event.which == 13) {
        searchPokemon();
     }
});

function axiosGetNextPokemon(){
    id++;
    axiosGetPokemon(`/${id}`);
}

function axiosGetPreviousPokemon(){
    if(id>1){
        id--;
        axiosGetPokemon(`/${id}`);
    }
    else{
        injectMessage("alert-info","List start reached!");
    }
}

function searchPokemon() {
    let value = $('#input-text').val();
    if (value!=="") {
        axiosGetPokemon(`/${value}`);
    }
}


async function axiosGetPokemon(pkQuery){
    try {
        const res = await pokemonAxios.get(`pokemon${pkQuery}`);
        const pokemon = res.data;
        currentPokemon = pokemon;
        console.log(pokemon);
        if (pokemon.length!==0) {
            id=pokemon.id;
            showPokemon(pokemon);
        }
    } catch (error){
        injectMessage("alert-danger",`No Pokemon found with ID: ${pkQuery.slice(1)}!`);
        console.log(`Something weird just happened: ${error}`);
    }
}

async function showPokemon(pokemon){
    const pk_name = pokemon.name;
    const pk_num = pokemon.id;
    const pk_type = getPokemonType(pokemon.types);
    const pk_HM = getPokemonHiddenMoves(pokemon.moves.HM);
    const img = pokemon.sprites.front_default;
    const img_shiny = pokemon.sprites.front_shiny;
    const pk_img = getImageTemplate(img);
    const pk_img_shiny = getImageTemplate(img_shiny);
    newPokemon = [pk_num,pk_img,pk_img_shiny,pk_name,pk_type,pk_HM];
    changePokemonInfo(newPokemon);

}
function changePokemonInfo(newPokemon){
    tdElements = $("#pk-info").children();
    for (let index = 0; index < tdElements.length; index++) {
        const tdElement = tdElements[index];
        $(tdElement).html(newPokemon[index]);
    }
}

function getImageTemplate(img){
    return `<img src="${img}" alt="Some Pokemon...">`;
}

function getPokemonType(types){
    let text;
    if(types){
        pk_types = types.map(({type}) => {
            return type.name;
        });
        text = pk_types.join(' & ');
    }
    else{
        text = "None";
    }
    return text;
}
function getPokemonHiddenMoves(hidden_moves){
    let text;
    if(hidden_moves){
        text = hidden_moves;
    }
    else{
        text = "None";
    }
    return text;
}


const injectPokemonCards = (favoritePk) => {
    favoritePk.map( 
        item => $('#cards-wrapper').append(
            `<div class="col-xs-12 col-md-3 card target-card mx-md-2 py-2 bg-dark text-white">
                <img src=${item.img} class="card-img-top img-limit" alt=${item.title}>
                <div class="card-body">
                    <h5 class="card-title text-center">${item.title}</h5>
                    <div class="card-text text-justify">
                        ${item.description}
                    </div>
                </div>
            </div>`
        )
    );
        
};

function injectMessage(alertType,msg){
    dangerElem = `
    <div class="alert ${alertType} text-center" role="alert">
        ${msg}
    </div>
    `;
    if($("div.alert").length){
        $("div.alert").remove();
    }
    $("main > div").append(dangerElem);
    $("div.alert").fadeTo(1500, 500).slideUp(500, function(){
        $("div.alert").slideUp(500);
        $("div.alert").remove();
    });
}

function injectNewFavorites(){

    if (!$("#cards-wrapper").length){
        $("main").append(`
        <section id="cards-wrapper" class="row col-md-12 bg-white py-2 justify-content-center">
        <div class="row col-md-12 bg-dark text-white py-2 text-center">
                <h1>Your Favorite Pokemon</h1>
        </div>
        </section>
        `);
    }

    injectPokemonCards(favoritePokemonToDisplay);
    favoritePokemonToDisplay = []; 
}


$("#addFavorite").on("click",()=>{
    let favsBefore = new Set(userInfo.favorites);
    if (!favsBefore.has(id)) {
        userInfo.favorites.push(id);
        currentPokemonInfo = getPokemonCardInfo(currentPokemon);
        if (showFavorites) {
            favoritePokemonToDisplay = [currentPokemonInfo];
            injectNewFavorites();
        }
        else{
            favoritePokemonToDisplay.push(currentPokemonInfo);
        }
        injectMessage("alert-success","Pokemon added to Favorites!");
        
    }
    else{
        injectMessage("alert-warning","Pokemon already in Favorites!");
    }
});