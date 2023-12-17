const RemoveDuplicateLetters = (letters) => {
  letters = letters || "AbraCadABraAlakAzam";
  let uniqLetters = [...new Set(letters)];
  //  let uniqLetters = letters.split("");
  uniqLetters = uniqLetters.reduce((outp, inp) => {
    if (!(outp[inp.toLowerCase()] || outp[inp.toUpperCase()])) {
      outp[inp] = 1;
    }
    return outp;
  }, {});
  uniqLetters = Object.keys(uniqLetters).join("");
  return uniqLetters;
};
export default RemoveDuplicateLetters;
