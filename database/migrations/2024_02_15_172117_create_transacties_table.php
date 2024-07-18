<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transacties', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('omzetnummer', 9)->default(Null);
            $table->foreignID('rekening_id');
            $table->foreignID('categorie_id');
            $table->string('datum',10)->default('0000-00-00');
            $table->string('omschrijving', 100)->default(Null);
            $table->decimal('bedrag',$precision=10, $scale=2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transacties');
    }
};
