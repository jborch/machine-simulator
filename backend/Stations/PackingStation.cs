using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class PackingStation : IMachine
{
    public string Name => "Packing";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private readonly UnloadingMachine _machine = new();

    public PackingStation(Conveyor input, Conveyor output)
    {
        _input = input;
        _output = output;
    }

    public void Tick()
    {
        _machine.Tick();

        if (_machine.HasOutput && _output.Input == null)
            _output.Input = _machine.Release();

        if (_input.Output != null && _machine.CanReceive)
            _machine.Receive(_input.TakeOutput()!);
    }

    public object GetState() => _machine.GetState();
}
