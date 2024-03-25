const checkIsNameMatches = (fullName, bankAccountName) => {
  const userFullNameArr = fullName.toLowerCase().split(' ');
  const accountNameArr = bankAccountName.toLowerCase().split(' ');

  const fullNameMatch = userFullNameArr.every((word) => accountNameArr.includes(word));

  return fullNameMatch;
};

module.exports = checkIsNameMatches;
