function getScrollTop(node) {
  return getScroll(node, 'scrollTop');
}

function getScrollLeft(node) {
  return getScroll(node, 'scrollLeft');
}

function getScroll(node, prop) {
  var result = 0;
  while (node) {
    result += node[prop] || 0;
    node = node.parentNode;
  }
  return result;
}

function getClosestReorderable(el) {
  while (el) {
    if (el.className &&
        el.className.indexOf('react-reorderable-item') >= 0) {
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
  var offsetTop = node.offsetTop + getScrollTop(node.parentNode);
  var nodeKey = node.getAttribute('data-reorderable-key');
  for (var i = 0; i < siblings.length; i += 1) {
    current = siblings[i];
    if (current.getAttribute('data-reorderable-key') !== nodeKey) {
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
    children[i] =
      <div className='react-reorderable-item'
        key={id} data-reorderable-key={id}>
        {children[i]}
      </div>;
    map[id] = children[i];
  }
  return { map: map, ids: ids };
}

function is(elem, selector) {
  var matches = elem.parentNode.querySelectorAll(selector);
  for (var i = 0; i < matches.length; i += 1) {
    if (elem === matches[i]) {
      return true;
    }
  }
  return false;
}

var ReactReorderable = React.createClass({
  componentWillMount: function () {
    var res = indexChildren(this.props.children);
    this.setState({
      order: res.ids,
      reorderableMap: res.map
    });
    window.addEventListener('mouseup', function () {
      this.setState({
        mouseDownPosition: null
      });
    }.bind(this));
  },
  componentWillReceiveProps: function (nextProps) {
    if (nextProps.children) {
      var res = indexChildren(nextProps.children);
      this.setState({
        order: res.ids,
        reorderableMap: res.map
      });
    }
  },
  getInitialState: function () {
    return { order: [], startPosition: null, activeItem: null, reorderableMap: {} };
  },
  onDragStop: function (e) {
    this.setState({
      activeItem: null,
      startPosition: null
    });
    this.props.onDrop(this.state.order.map(function (id) {
      return this.state.reorderableMap[id].props.children;
    }, this));
  },
  onDrag: function (e) {
    var handle = this.refs.handle.getDOMNode();
    var nextNode = getNextNode(handle);
    var currentKey = handle.getAttribute('data-reorderable-key');
    var order = this.state.order;

    var currentPos = order.indexOf(currentKey);
    order.splice(currentPos, 1);

    var nextKey = null;
    var nextPos = order.length;
    if (nextNode) {
      nextKey = nextNode.getAttribute('data-reorderable-key');
      nextPos = order.indexOf(nextKey);
    }

    order.splice(nextPos, 0, currentKey);
    this.setState({
      order: order
    });
    this.props.onDrag(nextPos);
    if (nextPos !== currentPos) {
      this.props.onChange(this.state.order.map(function (id) {
        return this.state.reorderableMap[id].props.children;
      }, this));
    }
  },
  onMouseDown: function (e) {
    if (!this.props.handle || is(e.target, this.props.handle)) {
      this.setState({
        mouseDownPosition: {
          x: e.clientX,
          y: e.clientY
        }
      });
    }
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
        var node = getClosestReorderable(e.target);
        var nativeEvent = e.nativeEvent;
        var id = node.getAttribute('data-reorderable-key');
        // React resets the event's properties
        this.props.onDragStart(this.state.reorderableMap[id]);
        this.activeItem = node;
        this.setState({
          mouseDownPosition: null,
          activeItem: id,
          startPosition: {
            x: node.offsetLeft - getScrollLeft(node),
            y: node.offsetTop - getScrollTop(node)
          }
        }, function () {
          this.refs.handle.handleDragStart(nativeEvent);
        }.bind(this));
      }
    }
  },
  render: function () {
    var children = this.state.order.map(function (id) {
      var className = (this.state.activeItem) ? 'noselect ' : '';
      if (this.state.activeItem === id) {
        className += 'react-reorderable-item-active';
      }
      return React.addons.cloneWithProps(
        this.state.reorderableMap[id], {
          ref: 'active',
          onMouseDown: this.onMouseDown,
          onMouseMove: this.onMouseMove,
          className: className
      });
    }, this);
    var handle;
    if (this.state.activeItem) {
      var pos = this.state.startPosition;
      handle = React.addons.cloneWithProps(
        this.state.reorderableMap[this.state.activeItem], {
          className: 'react-reorderable-handle'
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

ReactReorderable.propTypes = {
  onDragStart: React.PropTypes.func,
  onDrag: React.PropTypes.func,
  onDrop: React.PropTypes.func,
  onChange: React.PropTypes.func
};

ReactReorderable.defaultProps = {
  onDragStart: function () {},
  onDrag: function () {},
  onDrop: function () {},
  onChange: function () {}
};
