//Uniq Array
const RemoveDuplicatesNumbers = (numbers) => {
  numbers = numbers || [1, 1, 2, 1, 3, 4, 1, 5];
  const uniqNumbers = [...new Set(numbers)];
  return uniqNumbers;
};
export default RemoveDuplicatesNumbers;
