

app.get("/examples/delete/:id", (request, response) => {
  const id = request.params.id;
  db.run("DELETE FROM examples WHERE id=?", [id], () => {
    response.redirect("/projects");
  });
});

