using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class CappingStation : IMachine
{
    public string Name => "Capping";

    private static readonly Random _random = new();

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private readonly ProcessingMachine _machine;

    private static void Inspect(IMover mover)
    {
        if (mover.CurrentItem is Pen pen)
            pen.InspectionResult = _random.Next(100) < 5 ? 2 : 1;
    }

    public CappingStation(Conveyor input, Conveyor output)
    {
        _input = input;
        _output = output;
        _machine = new ProcessingMachine(105, "Capping", Inspect);
    }

    public void Reset() => _machine.Reset();

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
