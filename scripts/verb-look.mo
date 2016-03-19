.program #5:look
x = player;
notify(x, generate_json(["me" -> x.name, "here" -> x.location.name, "objs" -> x.location.contents, "tiles" -> x.location.tiles, "tilebag" -> x.location.tilebag]));

.
