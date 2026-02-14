namespace MachineSimulator.Backend.Models;

public class UnloadingMachine
{
    private const int UnloadingTicks = 100;

    private readonly CartonOutfeed _outfeed;
    private IMover? _currentMover;
    private int _ticksRemaining;

    public string State { get; private set; } = "Idle";
    public bool CanReceive => _currentMover == null;
    public bool HasOutput => State == "Done";

    public UnloadingMachine(CartonOutfeed outfeed)
    {
        _outfeed = outfeed;
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
            throw new InvalidOperationException("UnloadingMachine already has a mover.");

        _currentMover = mover;
        _ticksRemaining = UnloadingTicks;
        State = "Unloading";
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
        if (State != "Unloading")
            return;

        _ticksRemaining--;

        if (_ticksRemaining <= 0)
        {
            var carrier = (ICarrier)_currentMover!;
            if (carrier.CurrentItem != null)
                _outfeed.AcceptItem(carrier.CurrentItem);
            carrier.Unload();
            State = "Done";
        }
    }

    public object GetState() => new
    {
        State = State == "Unloading" ? $"{UnloadingTicks - _ticksRemaining}/{UnloadingTicks}" : State,
        Mover = _currentMover?.GetState(),
        TicksRemaining = _ticksRemaining,
        TotalTicks = UnloadingTicks
    };
}
