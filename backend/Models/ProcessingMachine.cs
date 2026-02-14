namespace MachineSimulator.Backend.Models;

public class ProcessingMachine
{
    private readonly int _processingTicks;
    private readonly string _processingState;
    private IMover? _currentMover;
    private int _ticksRemaining;

    public string State { get; private set; } = "Idle";
    public bool CanReceive => _currentMover == null;
    public bool HasOutput => State == "Done";

    public ProcessingMachine(int processingTicks, string processingState = "Processing")
    {
        _processingTicks = processingTicks;
        _processingState = processingState;
    }

    public void Reset()
    {
        _currentMover = null;
        _ticksRemaining = 0;
        State = "Idle";
    }

    public void Receive(IMover mover)
    {
        if (_currentMover != null)
            throw new InvalidOperationException("ProcessingMachine already has a mover.");

        _currentMover = mover;
        _ticksRemaining = _processingTicks;
        State = _processingState;
    }

    public IMover? Release()
    {
        if (State != "Done")
            return null;

        var mover = _currentMover;
        _currentMover = null;
        State = "Idle";
        return mover;
    }

    public void Tick()
    {
        if (State != _processingState)
            return;

        _ticksRemaining--;

        if (_ticksRemaining <= 0)
            State = "Done";
    }

    public object GetState() => new
    {
        State = State == _processingState ? $"{_processingTicks - _ticksRemaining}/{_processingTicks}" : State,
        Mover = _currentMover?.GetState(),
        TicksRemaining = _ticksRemaining,
        TotalTicks = _processingTicks
    };
}
