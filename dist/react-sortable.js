function getClosestSortable(el) {
  while (el) {
    if (el.className &&
        el.className.indexOf('react-sortable-item') >= 0) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
}

function getNextNode(node) {
  var p = node.parentNode;
  var siblings = p.children;
  var current;
  var minDistance = Infinity;
  var next = null;
  var offsetTop = node.offsetTop;
  for (var i = 0; i < siblings.length; i += 1) {
    current = siblings[i];
    if (current.getAttribute('data-sortable-key') !==
        node.getAttribute('data-sortable-key')) {
      var diff = current.offsetTop - offsetTop;
      if (diff > 0 && diff < minDistance) {
        minDistance = diff;
        next = current;
      }
    }
  }
  return next;
}

function indexChildren(children) {
  var prefix = 'node-';
  var map = {};
  var ids = [];
  for (var i = 0; i < children.length; i += 1) {
    id = prefix + (i + 1);
    ids.push(id);
    children[i] = React.addons.cloneWithProps(children[i], {
      className: 'react-sortable-item',
      key: id,
      'data-sortable-key': id
    });
    map[id] = children[i];
  }
  return { map: map, ids: ids };
}

var ReactSortable = React.createClass({displayName: "ReactSortable",
  componentWillMount: function () {
    var res = indexChildren(this.props.children);
    this.setState({
      order: res.ids,
      sortableMap: res.map
    });
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.children) {
      var res = indexChildren(this.props.children);
      this.setState({
        order: res.ids,
        sortableMap: res.map
      });
    }
  },
  getInitialState: function () {
    return { order: [], startPosition: null, activeItem: null, sortableMap: {} };
  },
  onDragStop: function (e) {
    this.setState({
      activeItem: null,
      startPosition: null
    });
  },
  onDrag: function (e) {
    var handle = this.refs.handle.getDOMNode();
    var nextNode = getNextNode(handle);
    var currentKey = handle.getAttribute('data-sortable-key');
    var order = this.state.order;

    var currentPos = order.indexOf(currentKey);
    order.splice(currentPos, 1);

    var nextKey = null;
    var nextPos = order.length;
    if (nextNode) {
      nextKey = nextNode.getAttribute('data-sortable-key');
      nextPos = order.indexOf(nextKey);
    }

    order.splice(nextPos, 0, currentKey);
    this.setState({
      order: order
    });
  },
  onMouseDown: function (e) {
    this.setState({
      mouseDownPosition: {
        x: e.clientX,
        y: e.clientY
      }
    });
  },
  onMouseMove: function (e) {
    if (!this.state.activeItem) {
      var initial = this.state.mouseDownPosition;
      // Still not clicked
      if (!initial) {
        return;
      }
      if (Math.abs(e.clientX - initial.x) >= 5 ||
          Math.abs(e.clientY - initial.y) >= 5) {
        var node = getClosestSortable(e.target);
        var rect = node.getBoundingClientRect();
        var nativeEvent = e.nativeEvent;
        this.activeItem = node;
        this.setState({
          mouseDownPosition: null,
          activeItem: node.getAttribute('data-sortable-key'),
          startPosition: {
            x: rect.left,
            y: rect.top
          }
        }, function () {
          // React resets the event's properties
          this.refs.handle.handleDragStart(nativeEvent);
        }.bind(this));
      }
    }
  },
  render: function () {
    var children = this.state.order.map(function (id) {
      var className = '';
      if (this.state.activeItem === id) {
        className += 'react-sortable-item-active';
      }
      return React.addons.cloneWithProps(
        this.state.sortableMap[id], {
          onMouseDown: this.onMouseDown,
          onMouseMove: this.onMouseMove,
          className: className
      });
    }, this);
    var handle;
    if (this.state.activeItem) {
      var pos = this.state.startPosition;
      handle = React.addons.cloneWithProps(
        this.state.sortableMap[this.state.activeItem], {
          className: 'react-sortable-handle'
      });
      handle =
        React.createElement(ReactDrag, {onStop: this.onDragStop, 
          onDrag: this.onDrag, 
          ref: "handle", 
          start: { x: pos.x, y: pos.y}}, 
          handle
        );
    }
    return (
      React.createElement("div", {ref: "wrapper"}, 
        children, 
        handle
      )
    );
  }
});
