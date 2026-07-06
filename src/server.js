require("dotenv").config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Evently app listening on port ${port}`);
});
