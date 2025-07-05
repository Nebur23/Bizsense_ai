from keras.models import load_model

model = load_model("model/best_model")  # folder, not file
print(model.summary())
