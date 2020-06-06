const {dataVerification, encryption, generateToken, sendMailToUser} = require('../services');
const {UserDAO} = require('../db/dao');

const applyRegistration = async (req,res,next) =>{
    try{
        const {email, pw, locale} = req.body;
        // TODO userDAO 다루는걸 service로 분리?
        const isAlreadyExist = await UserDAO.userAlreadyExist(email);

        if(isAlreadyExist){
            return false;
        }

        let isValid = dataVerification.verificateRegistration(email,pw,locale);
        if(isValid){
            const {encryptedPW, salt} = await encryption.encryptPW(pw);
            const registrationCode = await generateToken();
            await UserDAO.addUser(email, encryptedPW, locale, registrationCode, salt);
            await sendMailToUser(email, registrationCode);
        }
        else{
            return false;
        }
    }
    catch(e){
        next(e);
    }
    res.send('<script type="text/javascript">alert("이메일을 확인하세요."); window.location="/"; </script>');
}

const activateUser = async (req,res,next) => {
    try{
        const {token} = req.query.regtoken;

        await UserDAO.activateTokenUser(token);
    }
    catch(e){
        next(e);
    }
}

module.exports = {
    applyRegistration,
    activateUser
}