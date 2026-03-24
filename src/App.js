import { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7,
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20,
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0,
  },
];

function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(0); //null means no object selected

  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  function handleAddFriend(newFriend) {
    /*(friends) y the value to set using setFtiends to a new state, then we return => a NEW ARRAY
    //dont try to add with inbuilt array .push function, always prepare a new array
    //.. we spread the current array[...friends], and we added the new incoming (newFriend)*/
    setFriends((friends) => [...friends, newFriend]);
    //once we added a new friend we would like that the form dessapears as the initial state (closed)
    //for that case we always wnat to set as "false"
    setShowAddFriend(false);
  }

  function handleSelection(newSelectedFriend) {
    //setSelectedFriend(sFriend);
    setSelectedFriend((currentFriend) =>
      /*IMPORTANT: we use the ? that means only when IS NOT null
      //to avoid crash for trying to access property from a null object
      //this called optional chaining */
      currentFriend?.id === newSelectedFriend.id ? null : newSelectedFriend,
    );
    setShowAddFriend(false);
  }

  function handleSplitBill(value) {
    console.log(value);
    setFriends(
      //it update the the arraylist of friends
      //using map toi return a new array (and not mutating the actual one)
      friends.map((friend) =>
        //when we found the selected user to update
        friend.id === selectedFriend.id
          ? //fo that friend element we spreads the current one and replace the balance
            //based on the actual balance + (+/- incoming value)
            { ...friend, balance: friend.balance + value }
          : //if its not the friend to update just return without changes
            friend,
      ),
    );
    // a simpliest way to close the split bill component will be just
    // set selected friend to null, and when reload the components will remove it
    setSelectedFriend(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
        />
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}

        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add Friend"}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendList({ friends, selectedFriend, onSelection }) {
  //we lift initialFriends on level up (App) to be accesible across the components
  //const friends = initialFriends;

  return (
    <ul>
      {friends.map((friend) => (
        ////always provide the key property when loop a list
        <Friend
          friend={friend}
          key={friend.id}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, onSelection, selectedFriend }) {
  /*having the friendSeledted we will compare is we are rendering the same one
  //IMPORTANT: we use the ? that means only when IS NOT null
  //to avoid crash for trying to access property from a null object
  //this called optional chaining */
  const isSelected = selectedFriend?.id === friend.id; //is our flag
  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>
      {
        //when the balance is negative will apply red text
        friend.balance < 0 && (
          <p className="red">
            You owe {friend.name} {Math.abs(friend.balance)} $
          </p>
        )
      }
      {
        //when balance is positive will apply green text
        friend.balance > 0 && (
          <p className="green">
            {friend.name} Owes you {Math.abs(friend.balance)} $
          </p>
        )
      }
      {
        //when a friend dont owe you means balance 0 no apply any color text
        friend.balance === 0 && <p>You and {friend.name} are even </p>
      }
      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(e) {
    //first we prevent to relaoad the page
    e.preventDefault();
    //first lets check if na,e or image ar not empty to dont execute unused tasks
    if (!name || !image) return;

    //the name, image grab from the global state name and image
    const id = crypto.randomUUID();
    const newFriend = { id, name, image: `${image}?=${id}`, balance: 0 };
    console.log(newFriend);
    onAddFriend(newFriend);

    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>Friend Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <label>Image Url</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      ></input>
      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ selectedFriend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [myExpense, setMyExpense] = useState("");
  // note that for whos paying the bill we can use a boolean but will be very difficult
  //to implement when setting the value in the select element and grab as well
  const [paidBy, setPaidBy] = useState("user");
  // this is a derived value and as a null case, we will check first if this is not empty
  //by enclosing withing terneary operator
  const friendExpense = bill ? bill - myExpense : "";

  function handleSubmit(e) {
    e.preventDefault();
    if (!bill || !myExpense) return;
    /*if you (user) are who will paid the entire bill, you will only charge your friend their amount so we return friendExpense
// as positive value to update to the friends balance, but if friend(=!user) will pay then you will be charged
//only your expense so we return myExpense in negative to update our balance with that friend
*/
    onSplitBill(paidBy === "user" ? friendExpense : -myExpense);
  }
  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a Bill With {selectedFriend.name}</h2>
      <label>Bill Value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      ></input>
      <label>Your Expense</label>
      <input
        type="text"
        value={myExpense}
        onChange={(e) =>
          setMyExpense(
            Number(e.target.value) > bill ? myExpense : Number(e.target.value),
          )
        }
      ></input>
      <label>{selectedFriend.name}'s expense</label>
      <input type="text" disabled value={friendExpense}></input>
      <label>Who is paying the bill</label>
      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>
      <Button>Split Bill</Button>
    </form>
  );
}
