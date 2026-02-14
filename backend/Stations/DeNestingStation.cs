using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class DeNestingStation : IMachine
{
    public string Name => "DeNesting";
    public bool HasOutput => _machine.HasOutput;
    public bool CanReceive => _machine.CanReceive;

    private readonly LoadingMachine _machine = new();

    public IMover? Send() => _machine.Release();
    public void Receive(IMover mover) => _machine.Receive(mover);
    public void Tick() => _machine.Tick();
    public object GetState() => new { Machine = _machine.GetState() };
}
