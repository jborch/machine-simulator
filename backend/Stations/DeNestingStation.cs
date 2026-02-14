using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class DeNestingStation : IMachine
{
    public string Name => "DeNesting";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private readonly LoadingMachine _machine = new();

    public DeNestingStation(Conveyor input, Conveyor output)
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
