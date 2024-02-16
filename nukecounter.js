function sumNukesByType() {
  // Define the types of nukes to sum
  const nukeTypes = ["Full nukes:", "3/4 nukes:", "1/2 nukes:", "1/4 nukes:"];
  // Initialize an object to hold sums for each type
  const sums = {
    "Full nukes:": 0,
    "3/4 nukes:": 0,
    "1/2 nukes:": 0,
    "1/4 nukes:": 0,
  };

  // Select all <tr> elements
  const trElements = document.querySelectorAll('tr');

  trElements.forEach((tr) => {
    const tds = tr.querySelectorAll('td.item-padded');
    if (tds.length === 2 && nukeTypes.includes(tds[0].textContent.trim())) {
      // Extract the type and value
      const type = tds[0].textContent.trim();
      const value = parseInt(tds[1].textContent, 10);
      if (!isNaN(value)) {
        sums[type] += value;
      }
    }
  });

  return sums;
}

console.log(sumNukesByType());
