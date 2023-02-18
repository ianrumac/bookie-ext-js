const getAboutUsLink = require("../src/popup");

test("Return about-us for english language", () => {

  expect(getAboutUsLink("en-UK")).toBe("/about-us");

});
