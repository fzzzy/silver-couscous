
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
move(player, #4);
notify(player, "hello " + player.name);
.

;add_verb(#0, {#3, "x", "user_disconnected"}, {"this", "none", "this"})

.program #0:user_disconnected
move(player, #2);
.

;add_verb(#0, {#3, "x", "user_client_disconnected"}, {"this", "none", "this"})
.program #0:user_client_disconnected
move(player, #2);
.

;create(#2)
;#4.name = "World"

;create(#1)
;#5.name = "Player"

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

;add_verb(#3, {#3, "x", "look"}, {"none", "none", "none"})

.program #3:look
for x in (#2.contents)
  if (x != #6)
    notify(player, toliteral(x));
  endif
endfor
.
