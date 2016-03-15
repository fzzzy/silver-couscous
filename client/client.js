
import "babel-polyfill";
import { Socket } from "engine.io-client";
import * as React from "react";
import { render, findDOMNode } from "react-dom";

class OutputLine extends React.Component {
  render() {
    return <div>{ this.props.text }</div>;
  }
}

class Output extends React.Component {
  render() {
    let children = this.props.loglines.map((line, i) => {
      return <OutputLine key={ i } text={ line } />;
    });
    return <div style={{
      fontFamily: "monospace",
      whiteSpace: "pre"
    }}>
      { children }
    </div>;
  }
}

class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      checked: false
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
    return <div>
      <Output loglines={ this.props.loglines } />
      <div>&nbsp;</div>
      <div>&nbsp;</div>
      <div id="bottom">&nbsp;</div>
      <Input send={ this.props.send }/>
    </div>;
  }
}

class State {
  constructor() {
    this.loglines = [];
    this.scrollLocked = false;
    this.scrollIgnored = false;
  }

  log(logline) {
    this.loglines.push(logline);
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
    state.log(data.toString());
  });
  socket.on("close", () => {
    state.log("*** Disconnected ***");
  });
}

main();
