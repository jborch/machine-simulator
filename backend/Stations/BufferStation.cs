using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class BufferStation : IMachine
{
    public string Name => "Buffer";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private IMover? _mover;

    public BufferStation(Conveyor input, Conveyor output)
    {
        _input = input;
        _output = output;
    }

    public void Tick()
    {
        if (_mover != null && _output.Input == null)
        {
            _output.Input = _mover;
            _mover = null;
        }

        if (_mover == null && _input.Output != null)
            _mover = _input.TakeOutput();
    }

    public object GetState() => new { Mover = _mover?.GetState() };
}
