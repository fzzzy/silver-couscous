

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
