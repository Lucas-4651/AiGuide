import tkinter as tk
from tkinter import messagebox
import random

class HelloWorldApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Application Hello World")
        self.root.geometry("400x300")
        self.root.resizable(False, False)
        
        # Couleurs disponibles pour le fond aléatoire
        self.colors = ["#FFB6C1", "#98D8C8", "#FFD700", "#87CEEB", "#DDA0DD", 
                      "#F0E68C", "#E6E6FA", "#FFA07A", "#B0E0E6", "#FFC0CB"]
        
        self.setup_ui()
        
    def setup_ui(self):
        # Titre principal
        title_label = tk.Label(
            self.root, 
            text="Bienvenue dans l'application Hello World!", 
            font=("Arial", 14, "bold"),
            pady=20
        )
        title_label.pack()
        
        # Message de bienvenue par défaut
        self.welcome_label = tk.Label(
            self.root,
            text="Hello World!",
            font=("Arial", 16, "italic"),
            fg="blue"
        )
        self.welcome_label.pack(pady=10)
        
        # Frame pour le champ de saisie et le bouton de personnalisation
        input_frame = tk.Frame(self.root)
        input_frame.pack(pady=20)
        
        # Label et champ de saisie pour le nom
        name_label = tk.Label(input_frame, text="Entrez votre nom :", font=("Arial", 10))
        name_label.grid(row=0, column=0, padx=5)
        
        self.name_entry = tk.Entry(input_frame, width=20, font=("Arial", 10))
        self.name_entry.grid(row=0, column=1, padx=5)
        self.name_entry.bind("<Return>", self.personalize_message)  # Appuyer sur Entrée pour valider
        
        # Bouton de personnalisation du message
        personalize_btn = tk.Button(
            input_frame,
            text="Personnaliser le message",
            command=self.personalize_message,
            bg="#4CAF50",
            fg="white",
            font=("Arial", 10),
            cursor="hand2"
        )
        personalize_btn.grid(row=1, column=0, columnspan=2, pady=10)
        
        # Bouton pour changer la couleur de fond aléatoirement
        color_btn = tk.Button(
            self.root,
            text="Changer la couleur de fond",
            command=self.change_background_color,
            bg="#FF9800",
            fg="white",
            font=("Arial", 10),
            cursor="hand2"
        )
        color_btn.pack(pady=10)
        
        # Bouton pour quitter l'application
        quit_btn = tk.Button(
            self.root,
            text="Quitter",
            command=self.root.quit,
            bg="#f44336",
            fg="white",
            font=("Arial", 10),
            cursor="hand2"
        )
        quit_btn.pack(pady=10)
        
        # Label pour afficher le statut
        self.status_label = tk.Label(
            self.root,
            text="Prêt à personnaliser votre message!",
            font=("Arial", 9),
            fg="gray"
        )
        self.status_label.pack(side=tk.BOTTOM, pady=10)
        
    def personalize_message(self, event=None):
        """Personnalise le message de bienvenue avec le nom de l'utilisateur"""
        name = self.name_entry.get().strip()
        
        if name:
            # Message personnalisé
            welcome_message = f"Bonjour {name}! Bienvenue dans le monde de Tkinter!"
            self.welcome_label.config(text=welcome_message, fg="green")
            self.status_label.config(text=f"Message personnalisé pour {name}", fg="green")
        else:
            # Message d'erreur si aucun nom n'est saisi
            messagebox.showwarning(
                "Nom manquant",
                "Veuillez entrer votre nom pour personnaliser le message!"
            )
            self.status_label.config(text="Veuillez entrer votre nom", fg="red")
    
    def change_background_color(self):
        """Change la couleur de fond de manière aléatoire"""
        random_color = random.choice(self.colors)
        self.root.configure(bg=random_color)
        
        # Mettre à jour la couleur de fond de tous les widgets
        for widget in self.root.winfo_children():
            try:
                if isinstance(widget, tk.Frame):
                    widget.configure(bg=random_color)
                elif not isinstance(widget, tk.Button):  # Ne pas changer la couleur des boutons
                    widget.configure(bg=random_color)
            except:
                pass
        
        self.status_label.config(
            text=f"Couleur de fond changée en {random_color}", 
            fg="black"
        )

def main():
    # Création de la fenêtre principale
    root = tk.Tk()
    
    # Création de l'application
    app = HelloWorldApp(root)
    
    # Lancement de la boucle principale
    root.mainloop()

if __name__ == "__main__":
    main()
