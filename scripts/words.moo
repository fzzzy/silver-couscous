
.program here:eval
answer = eval("return " + argstr + ";");
if (answer[1])
  notify(player, tostr("=> ", toliteral(answer[2])));
else
  for line in (answer[2])
    notify(player, line);
  endfor
endif
.

.program here:eval
inputval = argstr;
if (inputval[1] == "{")
  inputval = parse_json(argstr);
  if ("call" in mapkeys(inputval))
    inputval = inputval["call"];
  endif
endif
answer = eval("return " + inputval + ";");
if (answer[1])
  notify(player, tostr("=> ", generate_json(answer[2])));
else
  for line in (answer[2])
    notify(player, line);
  endfor
endif
.

;add_verb(#0, {#3, "x", "user_connected"}, {"this", "none", "this"})

.program #0:user_connected
if (player != #3)
  move(player, #4);
  notify(player, "Hello " + player.name);
else
  notify(player, "Greetings Wizard");
endif
.

;add_verb(#0, {#3, "x", "user_disconnected"}, {"this", "none", "this"})
;add_verb(#0, {#3, "x", "user_client_disconnected"}, {"this", "none", "this"})

.program #0:user_disconnected
if (player == #3)
  move(player, #-1);
else
  move(player, #2);
endif
.

.program #0:user_client_disconnected
$user_disconnected();
.

;create(#2)
;#4.name = "Wordup Game"

;add_verb(#4, {#3, "x", "accept"}, {"this", "none", "this"})

;add_verb(#4, {#3, "x", "enterfunc"}, {"this", "none", "this"})

;add_verb(#4, {#3, "x", "exitfunc"}, {"this", "none", "this"})

;add_verb(#4, {#3, "x", "start_game"}, {"this", "none", "this"})
;add_verb(#4, {#3, "x", "play"}, {"any", "none", "none"})
;add_verb(#4, {#3, "x", "stop_game"}, {"this", "none", "this"})

;add_property(#4, "tilebag", {}, {#3, "r"})
;add_property(#4, "playing", #-1, {#3, "r"})
;add_property(#4, "letters", "bcdfghjklmnpqrstvwxyz", {#3, "r"})
;add_property(#4, "vowels", "aeiou", {#3, "r"})


.program #4:accept
if (length(this.contents) < 2)
  return true;
else
  return false;
endif
.

.program #4:enterfunc
if (this.player1 == #-1)
  this.player1 = player;
  player.name = "Player 1";
  notify(player, "Waiting for Player 2");
elseif (this.player2 == #-1)
  this.player2 = player;
  player.name = "Player 2";
  notify(this.player1, "Player 2 has arrived");
  this:start_game();
endif
.

.program #4:exitfunc
this:stop_game();
.


.program #4:start_game
this.tilebag = {};
x = 1;
tilebag = this.tilebag;
while (x < 50)
  x = x + 1;
  tilebag = {@tilebag, this.letters[random(21)]};
endwhile
this.tilebag = tilebag;
for x in (this.contents)
  if (is_player(x))
    tiles = {};
    i = 1;
    while (i < 10)
      i = i + 1;
      if (length(this.tilebag))
        tiles = {@tiles, this.tilebag[1]};
        this.tilebag = listdelete(this.tilebag, 1);
      endif
    endwhile
    x.hand = tiles;
    notify(x, "Game has started");
    notify(x, generate_json(["me" -> x.name, "here" -> x.location.name, "objs" -> x.location.contents, "tiles" -> x.location.tiles, "hand" -> x.hand]));
  endif
endfor
this.playing = this.player1;
notify(this.player1, "Player 1, your turn");
.

.program #4:play

.

.program #4:stop_game
for x in (this.contents)
  if (is_player(x))
    notify(x, player.name + " has disconnected. Game has ended");
    boot_player(x);
  endif
endfor
this.player1 = #-1;
this.player2 = #-1;
.

;add_property(#4, "tiles", {{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0},{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}}, {#3, "r"})

;add_property(#4, "player1", #-1, {#3, "r"})
;add_property(#4, "player2", #-1, {#3, "r"})

;create(#1)
;#5.name = "Player"

;add_property(#5, "hand", {}, {#3, "r"})

;chparent(#3, #5)

;create(#5)
;#6.name = "Player 1"
;set_player_flag(#6, 1)
;move(#6, #2)

;create(#5)
;#7.name = "Player 2"
;set_player_flag(#7, 1)
;move(#7, #2)

.program #0:do_login_command
if (argstr == "")
  return #-1;
endif
if (argstr == "asdf")
  return #3;
endif
for x in (#2.contents)
  if (x != #3)
    return x;
  endif
endfor
notify(player, "Sorry, the server is full.");
.

;add_verb(#5, {#3, "x", "look"}, {"none", "none", "none"})

.program #5:look
notify(player, generate_json(["me" -> player.name, "here" -> player.location.name, "objs" -> player. location. contents]));
.
