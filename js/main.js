window.onload = ()=>{
    $("#register-form").hide();
};

showRegisterForm = ()=>{
    $("#login-form").hide();
    $("#register-form").show();
};

$("a.signup-link").on("click",showRegisterForm);

$("#refresh-btn").on("click",()=>{
    $("#login-form").show();
    $("#register-form").hide();
});
 

let getInput = (formID)=>{
    let inputs = $(formID).find("input");
    let formElement = $(formID)[0];
    let values = {};
    let fieldEmpty = false;
    for (let index = 0; index < inputs.length; index++) {
        const element = inputs[index];
        fieldEmpty = fieldEmpty || element.value==="";
        values[element.name]=element.value;
    }
    if (fieldEmpty) {
        values ={};
        injectMessage("alert-danger","Empty Field!");
    }
    else if(!formElement.checkValidity()){
        values ={};
        formElement.reportValidity();
    }

    return values;
};

function injectMessage(alertType,msg){
    dangerElem = `
    <div class="alert ${alertType}" role="alert">
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

$("#login-btn").on("click",(myEvent)=>{
    myEvent.preventDefault();
    let values = getInput("#login-form");
    if(!jQuery.isEmptyObject(values)){
        console.log("get credentials from server to validate!");
        verifyUserCredentials(values);
    }
});

$("#register-btn").on("click", async (myEvent)=>{
    myEvent.preventDefault();
    let values = getInput("#register-form");
    if (!jQuery.isEmptyObject(values)) {
        pass1 = values.new_password;
        pass2 = values.confirmed_password;
        no_space1 =pass1.replace(/\s/g, "");
        no_space2 =pass2.replace(/\s/g, "");
        let samePassword = pass1===pass2 && no_space1===no_space2;
        if(samePassword){
            let NoSpacesInPassword = no_space1===pass1;
            if (NoSpacesInPassword) {
                console.log("send input to server!");
                const status = await sendUserToServer(values);
                console.log(typeof(status));
                if (status>=200 && status<300) {
                    $("#login-form").show();
                    $("#register-form").hide();
                    injectMessage("alert-success","User successfully registered");
                }
                else{
                    injectMessage("alert-danger","Something wrong happened, please try again..");
                }
            }
            else{
                injectMessage("alert-danger","Passwords can't have spaces");
            }
        }
        else{
            injectMessage("alert-danger","Passwords doesn't match");
        }
    }
});

async function sendUserToServer({email,new_password}){
    
    const userData = {
        id: "",
        email: email,
        password: new_password,
        favorites: []
    };
    let status = await axiosSendUser(userData);
    status = parseInt(status);
    return status;
}

async function verifyUserCredentials({email,password}){
    user = await axiosGetUser(`/?email=${email}`);
    if(user.length!==0){
        if (user.password===password) {
            console.log("Login succesfull (changing page");
            storeInformation(user);
            self.location = "./app.html";
        }
        else{
            injectMessage("alert-danger","Wrong password!");
        }
    }
    else{
        injectMessage("alert-danger","No user with those credentials");
    }
}

function storeInformation({id,email,favorites}){
    sessionStorage.setItem('userEmail',email);
    sessionStorage.setItem('userID',id);
    sessionStorage.setItem('userFavorites',JSON.stringify(favorites));
}

let usersAxios = axios.create({
    baseURL: "https://dnp-api-db.herokuapp.com/"
});


async function axiosSendUser(userData){
    try {
        const {status} = await usersAxios.post('users',userData);
        return status;

    } catch (error) {
        console.log(`Something weird just happened: ${error}`);
    }
}



async function axiosGetUser(userQuery){
    try {
        const {data} = await usersAxios.get(`users${userQuery}`);
        if (data.length!==0) {
            return data[0];
        }
        return [];

    } catch (error) {
        console.log(`Something weird just happened: ${error}`);
    }
}