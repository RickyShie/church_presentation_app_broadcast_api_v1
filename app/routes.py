from flask import render_template, flash, request
from app import app
from app.forms import BibleSearchForm, SermonMetadataForm, AnnouncementForm
from app.models import Bible

@app.route("/")
@app.route("/index")
def index():
    return render_template("base.html")


@app.route("/bible_search", methods=["GET", "POST"])
def bible_search():
    # 1) Give each form a unique prefix so field names don't collide
    form = BibleSearchForm()

    # 2) POST: detect which form was submitted and validate only that one
    if request.method == "POST":

        # --- Bible Search form submitted ---
        if form.submit.data and form.validate():
            book_code   = form.book_name.data
            chapter     = form.chapter.data
            start_verse = form.start_verse.data
            end_verse   = form.end_verse.data
            translations = form.translations.data

            query = (
                Bible.query
                .filter(Bible.book_code == book_code)
                .filter(Bible.chapter == chapter)
                .filter(Bible.verse >= start_verse, Bible.verse <= end_verse)
                .filter(Bible.translation.in_(translations))
                .order_by(Bible.translation, Bible.verse)
            )

            results = query.all()
            results_json = [r.to_dict() for r in results]

            # socketio.emit("bible_search_results", {"bible_search_results": results_json})
            flash("Bible search results sent to the display.", "success")
            return render_template("bible_search_form.html",
                                   form=form, bible_search_results_json=results_json)

    # GET (or failed POST) – show both forms
    return render_template("bible_search_form.html", form=form)


@app.route("/announcement_search", methods=["GET", "POST"])
def announcement_search():
    form = AnnouncementForm()

    if form.validate_on_submit():
        google_slide_url = form.google_slide_url.data
        # socketio.emit("google_slides_url_result", {"google_slides_url_result": google_slide_url})
        return render_template("announcement_search_form.html",
                               form=form, google_slide_url=google_slide_url)

    return render_template("announcement_search_form.html", form=form)


@app.route("/display")
def display():
    return render_template("display.html")