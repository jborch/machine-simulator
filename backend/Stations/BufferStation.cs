using MachineSimulator.Backend.Models;

namespace MachineSimulator.Backend.Stations;

public class BufferStation : IMachine
{
    private const int ReleaseCooldown = 150;

    public string Name => "Buffer";

    private readonly Conveyor _input;
    private readonly Conveyor _output;
    private readonly Queue<IMover> _queue = new();
    private int _ticksSinceLastOutput;

    public BufferStation(Conveyor input, Conveyor output)
    {
        _input = input;
        _output = output;
    }

    public void Reset()
    {
        _queue.Clear();
        _ticksSinceLastOutput = ReleaseCooldown;
    }

    public void Initialize()
    {
        _ticksSinceLastOutput = ReleaseCooldown;
        for (int i = 0; i < 12; i++)
            _queue.Enqueue(new Mover($"mover-{i + 1}"));
    }

    public void Tick()
    {
        _ticksSinceLastOutput++;

        // Accept from input conveyor
        if (_input.Output != null)
            _queue.Enqueue(_input.TakeOutput()!);

        // Release one to output conveyor at most every ReleaseCooldown ticks
        if (_queue.Count > 0 && _output.Input == null && _ticksSinceLastOutput >= ReleaseCooldown)
        {
            _output.Input = _queue.Dequeue();
            _ticksSinceLastOutput = 0;
        }
    }

    public object GetState() => new { QueueLength = _queue.Count };
}
