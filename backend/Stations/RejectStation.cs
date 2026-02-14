using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class RejectStation : IMachine
{
    public string Name => "Reject";
    public bool HasOutput => _mover != null;
    public bool CanReceive => _mover == null;

    private IMover? _mover;

    public IMover? Send() { var m = _mover; _mover = null; return m; }
    public void Receive(IMover mover) => _mover = mover;
    public void Tick() { }
    public object GetState() => new { Mover = _mover?.GetState() };
}
