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
    if (current.getAttribute('data-sortable-key') !== node.getAttribute('data-sortable-key')) {
      var diff = current.offsetTop - offsetTop;
      if (diff > 0 && diff < minDistance) {
        minDistance = diff;
        next = current;
      }
    }
  }
  return next;
}

var ReactSortable = React.createClass({
  _indexChildren: function (c) {
    var ids = [];
    var prefix = 'node-';
    var id;
    this.sortableMap = {};
    for (var i = 0; i < c.length; i += 1) {
      id = prefix + (i + 1);
      ids.push(id);
      c[i] = React.addons.cloneWithProps(c[i], {
        className: 'react-sortable-item',
        key: id,
        'data-sortable-key': id
      });
      this.sortableMap[id] = c[i];
    }
    this.setState({
      order: ids
    });
  },
  componentWillMount: function () {
    this._indexChildren(this.props.children)
    window.addEventListener('mouseup');
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.children) {
      this._indexChildren(nextProps.children);
    }
  },
  getInitialState: function () {
    // Our state doesn't depends on activeNode
    // so it is not required to resides in the state
    this.activeNode = null;
    return { order: [], activeItem: null };
  },
  onDragStop: function (e) {
    this.setState({
      activeItem: null
    });
  },
  onDrag: function (e) {
    var currentNextNode = this.activeItem.nextSibling;
    var nextNode = getNextNode(this.refs.handle.getDOMNode());

    console.log(this.refs.handle);

    if (currentNextNode === nextNode) {
      return;
    }

    var id = this.activeItem.getAttribute('data-sortable-key');
    var order = this.state.order;
    var afterIdx = order.length;
    order.splice(order.indexOf(id), 1);
    if (nextNode) {
      afterIdx = order.indexOf(nextNode.getAttribute('data-sortable-key'));
    }
    order.splice(afterIdx, 0, id);

    var self = this;
    this.setState({
      order: order
    });
  },
  onMouseDown: function (e) {
    this.setState({
      initialCoordinates: {
        x: e.clientX,
        y: e.clientY
      }
    });
  },
  onMouseMove: function (e) {
    if (!this.state.activeItem) {
      var initial = this.state.initialCoordinates;
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
          initialCoordinates: null,
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
      return React.addons.cloneWithProps(this.sortableMap[id], {
        onMouseDown: this.onMouseDown,
        onMouseMove: this.onMouseMove,
        className: className
      });
    }, this);
    var handle;
    if (this.state.activeItem) {
      var pos = this.state.startPosition;
      handle = React.addons.cloneWithProps(this.sortableMap[this.state.activeItem], {
        className: 'react-sortable-handle'
      });
      handle =
        <ReactDrag onStop={this.onDragStop}
          onDrag={this.onDrag}
          ref="handle"
          start={{ x: pos.x, y: pos.y }}>
          {handle}
        </ReactDrag>;
    }
    return (
      <div ref="wrapper">
        {children}
        {handle}
      </div>
    );
  }
});
