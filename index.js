   
    import './counting-zone.js';
    
    var outputElem = document.getElementById('output');
    var countingZoneSpec = Zone['countingZoneSpec'];
    var myCountingZone = Zone.current.fork(countingZoneSpec).fork({
      onScheduleTask(parent, current, target, task) {
        parent.scheduleTask(target, task);
        console.log('Scheduled ' + task.source + ' => ' + task.data.handleId);
        outputElem.innerText = countingZoneSpec.counter();
      },
      onInvokeTask(parent, current, target, task) {
        console.log('Invoking ' + task.source + ' => ' + task.data.handleId);
        parent.invokeTask(target, task);
        outputElem.innerText = countingZoneSpec.counter();
      },
      onHasTask(parent, current, target, hasTask) {
        if (hasTask.macroTask) {
          console.log("There are outstanding MacroTasks.");
        } else {
          console.log("All MacroTasks have been completed.");
        }
      }
    });

    /*
     * We want to profile just the actions that are a result of this button, so with
     * a single line of code, we can run `main` in the countingZone
     */

    b1.addEventListener('click', function () {
      myCountingZone.run(main);
    });


    /*
     * Spawns a bunch of setTimeouts which in turn spawn more setTimeouts!
     * This is a boring way to simulate HTTP requests and other async actions.
     */

    function main () {
      for (var i = 0; i < 10; i++) {
        recur(i, 800);
      }
    }

    function recur (x, t) {
      if (x > 0) {
        setTimeout(function () {
          for (var i = x; i < 8; i++) {
            recur(x - 1, Math.random()*t);
          }
        }, t);
      }
    }


    /*
     * There may be other async actions going on in the background.
     * Because this is not in the zone, our profiling ignores it.
     * Nice.
     */
    function noop () {
      setTimeout(noop, 10*Math.random());
    }
    noop();