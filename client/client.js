

import "babel-polyfill";
import { Socket } from "engine.io-client";
import * as React from "react";
import { DragSource, DragDropContext, DropTarget } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import { default as TouchBackend } from 'react-dnd-touch-backend';

import { render, findDOMNode } from "react-dom";
import { get } from "axios";

const BUTTON_BACKGROUND_COLOR = "#efefef";
const BUTTON_BORDER_COLOR = "#ababab";

const TILE_STYLES = {
  display: "inline-block",
  height: "16px",
  width: "16px",
  border: "1px solid #ababab",
  marginRight: "1em",
  textAlign: "center",
  fontSize: "9pt"
};


class Tile extends React.Component {
  render() {
    const { isDragging, connectDragSource, text } = this.props;
    console.log("isdragging", isDragging);
    let styles = JSON.parse(JSON.stringify(TILE_STYLES));
    styles.opacity = isDragging ? 0.5 : 1;
    return connectDragSource(
      <div style={ styles }>
        { text }
      </div>
    );
  }
}

Tile = DragSource("CARD", {
  beginDrag(props) {
    return {
      text: props.text
    };
  }
}, function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
})(Tile);

class Target extends React.Component {
  render() {
    const { canDrop, isOver, connectDropTarget } = this.props;
    const isActive = canDrop && isOver;

    let backgroundColor = this.props.backgroundColor;
    if (isActive) {
      backgroundColor = 'darkgreen';
    } else if (canDrop) {
      backgroundColor = 'darkkhaki';
    }

    let text = this.props.text;
    if (text === 0) {
      text = "";
    }
    let color = "black";
    if (this.props.backgroundColor === "black") {
      color = "white";
    }

    return connectDropTarget(
      <span style={{
        display: "inline-block",
        height: "16px",
        width: "16px",
        margin: "3px",
        border: "1px solid black",
        backgroundColor: backgroundColor,
        color: color,
        textAlign: "center",
        verticalAlign: "middle",
        fontSize: "8pt"
      }}>
        { text }
      </span>
    );
  }
}



Target = DropTarget("CARD", {
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  }
}, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop()
}))(Target);


class Script extends React.Component {
  async click() {
    let result = await get("/scripts/" + this.props.script);
    this.props.send(result.data);
  }

  render() {
    return <div
      style={{
        padding: "0.5em",
        backgroundColor: BUTTON_BACKGROUND_COLOR,
        cursor: "pointer",
        borderBottom: `1px solid ${BUTTON_BORDER_COLOR}`,
        borderLeft: `1px solid ${BUTTON_BORDER_COLOR}`
      }}
      key={ this.props.key }
      onClick={ this.click.bind(this) }>
      { this.props.script }
    </div>;
  }
}

class Scripts extends React.Component {
  async componentDidMount() {
    let result = await get("/scripts/");
    state.setScripts(result.data.scripts);
  }

  click(e) {
    e.preventDefault();
    state.toggleScriptsPanel();
  }

  render() {
    let scripts = null,
        togglerStyles = {
          padding: "0.5em",
          backgroundColor: "#efefef",
          borderBottom: `1px solid ${BUTTON_BORDER_COLOR}`,
          borderLeft: `1px solid ${BUTTON_BORDER_COLOR}`,
          textAlign: "right",
          cursor: "pointer",
          fontSize: "10pt"
        };
    if (! state.scriptsPanelOpen) {
      scripts = <div style={ togglerStyles } onClick={ this.click.bind(this) }>
        Open Scripts
      </div>;
    } else {
      scripts = state.scripts.map((script, index) => {
        return <Script
          send={ this.props.send }
          key={ `scripts-${index}` }
          script={ script } />;
      });
      scripts.unshift(<div
        key="closer"
        style={ togglerStyles }
        onClick={ this.click.bind(this) }>
        Close Scripts
      </div>);
    }

    return <div
      style={{
        position: "fixed",
        top: "0px",
        right: "0px"
      }}>
      { scripts }
    </div>;
  }
}

class OutputLine extends React.Component {
  render() {
    return <div>{ this.props.text }</div>;
  }
}

class Output extends React.Component {
  render() {
    let children = this.props.loglines.map((line, i) => {
      return <OutputLine key={ `output-${i}` } text={ line } />;
    });
    return <div style={{
      paddingTop: "25px",
      fontFamily: "monospace",
      paddingRight: "410px"
    }}>
      { children }
    </div>;
  }
}

class Player extends React.Component {
  render() {
    let hand = [];
    for (let i in this.props.hand) {
      hand.push(<Tile
        key={ `hand-${i}` }
        text={ this.props.hand[i] } />);
    }
    return <div
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        padding: "0.5em",
        backgroundColor: "#efefef",
        fontSize: "10pt"
      }}>
      <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>
        Player:
      </span>
      { this.props.me }
      <span style={{ fontWeight: "bold", marginRight: "0.5em", marginLeft: "0.5em"}}>
        Tiles:
      </span>
      { hand }
      <button onClick={(event) => {
          event.preventDefault();
          this.props.send("end_turn");
          console.log("ONCLICKPLAY");
      }}>
        Play
      </button>
    </div>;
  }
}

class World extends React.Component {
  render() {
    let vowels = Array.prototype.map.call(["a", "e", "i", "o", "u"], (x, i) => {
      return <Tile key={ `vowel-${i}` } text={ x } />;
    });

    let tiles = [];
    for (let y = 0; y < 17; y++) {
      let row = [];
      tiles.push(<div key={ `row-${y}` }>{ row }</div>);
      for (let x = 0; x < 17; x++) {
        let backgroundColor = "white";
        if ((x === 4 || x === 12) && (y === 4 || y === 12)) {
          backgroundColor = "black";
        }
        row.push(<Target
          text={ this.props.tiles[y][x] }
          onDrop={ (item) => {
            console.log("it is dropped", item, x, y);
            this.props.send(
              "play " + JSON.stringify({play: item.text, x, y}));
          } }
          key={ `column-${x}` }
          backgroundColor={ backgroundColor } />);
      }
    }
    return <div
      style={{
        position: "fixed",
        top:"0px",
        right: "0px",
        minWidth: "410px",
        padding: "0.5em",
        backgroundColor: "#efefef"
      }}>
      <div style={{
        fontSize: "10pt",
        marginBottom: "1em"
      }}>
        <span style={{ fontWeight: "bold", marginRight: "0.5em" }}>
          In:
        </span>
        { this.props.here }
        <span style={{ fontWeight: "bold", marginRight: "0.5em", marginLeft: "0.5em" }}>
          Vowels:
        </span>
        { vowels }
      </div>
      { tiles }
    </div>;
  }
}

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      checked: true
    };
  }

  componentDidMount() {
    let input = findDOMNode(this.refs.input);
    input.focus();
  }

  onChange(event) {
    this.setState({input: event.target.value});
  }

  onCheckboxChange(event) {
    let input = findDOMNode(this.refs.input);
    this.setState({
      checked: event.target.checked,
      input: input.value});
  }

  onSwitch(event) {

  }

  onSubmit(event) {
    event.preventDefault();
    this.props.send(this.state.input);
    this.setState({input: ""});
    let input = findDOMNode(this.refs.input);
    input.value = "";
  }

  render() {
    let actualInput = null;
    if (! this.state.checked) {
      actualInput = <textarea
        style={{
          width: "85%",
          height: "3em",
          verticalAlign: "middle"
        }}
        ref="input"
        value={ this.state.input }
        onChange={ this.onChange.bind(this) }
        />;
    } else {
      actualInput = <input
        style={{
          width: "85%",
          verticalAlign: "middle"
        }}
        ref="input"
        value={ this.state.input }
        onChange={ this.onChange.bind(this) }
        />;
    }
    return <div style={{
      position: "fixed",
      left: "7px",
      right: "7px",
      bottom: "7px"
    }}>
      <form
        style={{
          margin: "0px"
        }}
        onSubmit={ this.onSubmit.bind(this) }>
        { actualInput }
        <input
          type="checkbox"
          checked={ this.state.checked }
          title="Send on return or enter"
          style={{
            verticalAlign: "middle"
          }}
          onChange={ this.onCheckboxChange.bind(this) } />
        <button
          style={{
            width: "10%",
            verticalAlign: "middle"
          }}>
          Send
        </button>
      </form>
    </div>;
  }
}

class Screen extends React.Component {
  componentDidMount() {
    window.addEventListener(
      "scroll", this.onScroll);
  }

  onScroll() {
    if (state.scrollIgnored) {
      state.nextScrollIgnored();
      return;
    }
    if (state.lockScroll()) {
      setTimeout(() => {
        state.unlockScroll();
      }, 5000);
    }
  }

  render() {
    let player = null,
        world = null;
    if (this.props.me) {
      player = <Player
        me={ this.props.me }
        hand={ this.props.hand }
        send={ this.props.send }/>;
      world = <World
        here={ this.props.here }
        tiles={ this.props.tiles }
        send={ this.props.send } />;
    }
    let output = <Output loglines={ this.props.loglines } />;
    return <div>
      { player }
      { world }
      <Scripts send={ this.props.send } />
      { output }
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div id="bottom">&nbsp;</div>
      <Input send={ this.props.send } />
    </div>;
  }
}


Screen = DragDropContext(HTML5Backend)(Screen);


//Screen = DragDropContext(
//  TouchBackend({
//    enableMouseEvents: true}))(Screen);


class State {
  constructor() {
    this.loglines = [];
    this.scripts = [];
    this.serverState = {};
    this.scrollLocked = false;
    this.scrollIgnored = false;
    this.scriptsPanelOpen = false;
  }

  toggleScriptsPanel() {
    this.scriptsPanelOpen = ! this.scriptsPanelOpen;
    draw();
  }

  log(logline) {
//    console.log(logline);
    this.loglines.push(logline);
    draw();
  }

  setScripts(scripts) {
    this.scripts = scripts;
    draw();
  }

  setServerState(state) {
    this.serverState = state;
    draw();
  }

  lockScroll() {
    let wasLocked = this.scrollLocked;
    this.scrollLocked = true;
    return !wasLocked;
  }

  unlockScroll() {
    this.scrollLocked = false;
  }

  ignoreNextScroll() {
    this.scrollIgnored = true;
  }

  nextScrollIgnored() {
    this.scrollIgnored = false;
  }
}

let state = new State();

function draw() {
  render(
    <Screen
      loglines={ state.loglines }
      me={ state.serverState.me }
      here={ state.serverState.here }
      objs={ state.serverState.objs }
      tiles={ state.serverState.tiles }
      hand={ state.serverState.hand }
      send={ send } />,
    document.getElementById("react-root"));
  if (!state.scrollLocked) {
    state.ignoreNextScroll();
    document.getElementById("bottom").scrollIntoView();
  }
}


function open() {
  return new Promise((resolve, reject) => {
    let socket = Socket("ws://localhost:8080");
    socket.on("open", () => {
      resolve(socket);
    });
  });
}

let send = null;

async function main() {
  let socket = await open();
  console.log("sending location", location.hash.slice(1));
  socket.send(location.hash.slice(1));
  send = (data) => {
    let prefix = "> ";
    for (let line of data.split("\n")) {
      state.log(prefix + line);
      if (prefix === "> ") {
        prefix = "  ";
      }
    }
    socket.send(data);
  };
  socket.on("message", (data) => {
    let split = data.toString().split("\n");
    for (let line of split) {
      if (line.length && line[0] === "{") {
        let obj = JSON.parse(line);
        state.setServerState(obj);
        console.log("setServerState", obj);
      } else {
        state.log(line);
      }
    }
  });
  socket.on("close", () => {
    state.log("Connection with the server has been closed.");
    send = null;
    socket = null;
  });
}

main();
