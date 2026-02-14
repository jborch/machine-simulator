namespace MachineSimulator.Backend.Models;

public class Mover : IMover, ICarrier
{
    public string Id { get; }
    public IItem? CurrentItem { get; private set; }

    public Mover(string id)
    {
        Id = id;
    }

    public void Load(IItem item)
    {
        CurrentItem = item;
    }

    public void Unload()
    {
        CurrentItem = null;
    }

    public MoverState GetState() => new(Id, CurrentItem?.Id);
}
