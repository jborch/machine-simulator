namespace MachineSimulator.Backend.Models;

public class LoadingMachine
{
    private const int LoadingTicks = 10;

    private IMover? _currentMover;
    private int _ticksRemaining;
    private int _penCounter;

    public string State { get; private set; } = "Idle";
    public bool CanReceive => _currentMover == null;
    public bool HasOutput => State == "Done";

    public void Receive(IMover mover)
    {
        if (_currentMover != null)
            throw new InvalidOperationException("LoadingMachine already has a mover.");

        _currentMover = mover;
        _ticksRemaining = LoadingTicks;
        State = "Loading";
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
        if (State != "Loading")
            return;

        _ticksRemaining--;

        if (_ticksRemaining <= 0)
        {
            _penCounter++;
            var pen = new Pen($"pen-{_penCounter}");
            ((ICarrier)_currentMover!).Load(pen);
            State = "Done";
        }
    }

    public object GetState() => new
    {
        State,
        Mover = _currentMover?.GetState(),
        TicksRemaining = _ticksRemaining
    };
}
