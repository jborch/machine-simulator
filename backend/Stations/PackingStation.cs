using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class PackingStation : IMachine
{
    public string Name => "Packing";
    public bool HasOutput => _machine.HasOutput;
    public bool CanReceive => _machine.CanReceive;

    private readonly UnloadingMachine _machine = new();

    public IMover? Send() => _machine.Release();
    public void Receive(IMover mover) => _machine.Receive(mover);
    public void Tick() => _machine.Tick();
    public object GetState() => new { Machine = _machine.GetState() };
}
